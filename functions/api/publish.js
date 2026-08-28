import { json, github, auth, buildFrontmatter, toBase64, b64ByteLength, ghPath, parseFrontmatter, utf8FromB64 } from './_lib.js';

const CATEGORIES = ['meme', 'joke', 'quote', 'gif', 'image', 'other'];
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const SLUG_RE = /^[\p{L}\p{N}][\p{L}\p{N}_-]{0,60}$/u;

function safeContentPath(date, slug) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!SLUG_RE.test(slug)) return null;
  return `content/fun/${date}-${slug}.md`;
}

function safeImagePath(date, slug, ext) {
  if (!SLUG_RE.test(slug)) return null;
  if (!ext || !IMAGE_EXTS.includes(ext.toLowerCase())) return null;
  return `public/images/memes/${date}-${slug}${ext.toLowerCase()}`;
}

async function fileExists(path, env) {
  try {
    await github(`/repos/${env.GITHUB_REPO}/contents/${ghPath(path)}?branch=main`, env);
    return true;
  } catch (e) {
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  const denied = await auth(request, env);
  if (denied) return denied;

  try {
    const body = await request.json();

    const title = String(body.title || '').trim();
    const date = String(body.date || '').trim();
    const category = String(body.category || '').trim();
    const slug = String(body.slug || '').trim();
    const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [];
    const description = body.description ? String(body.description).trim() : '';
    const source = body.source ? String(body.source).trim() : '';
    const bodyText = String(body.body || '').trim();
    const imageAlt = body.imageAlt ? String(body.imageAlt).trim() : '';
    const existingPath = body.existingPath ? String(body.existingPath) : '';

    if (!title) return json({ error: '标题不能为空' }, 400);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: '日期格式应为 YYYY-MM-DD' }, 400);
    if (!CATEGORIES.includes(category)) return json({ error: '无效的分类' }, 400);
    if (!slug) return json({ error: 'slug 不能为空' }, 400);

    const contentPath = safeContentPath(date, slug);
    if (!contentPath) return json({ error: '路径非法' }, 400);

    // Determine target path: editing existing or creating new
    let targetPath = contentPath;
    let sha = null;
    if (existingPath) {
      if (!/^content\/fun\/[\p{L}\p{N}._-]+\.md$/u.test(existingPath)) return json({ error: '原路径非法' }, 400);
      targetPath = existingPath;
    } else {
      if (await fileExists(contentPath, env)) {
        return json({ error: `已存在同名内容 "${contentPath}"，请更换 slug 或进入编辑模式` }, 409);
      }
    }
    let originalImage = null;
    if (existingPath) {
      try {
        const existing = await github(`/repos/${env.GITHUB_REPO}/contents/${ghPath(existingPath)}?branch=main`, env);
        sha = existing.sha;
        const { data: orig } = parseFrontmatter(utf8FromB64(existing.content));
        originalImage = orig.image || null;
      } catch (e) {
        return json({ error: `原内容不存在：${existingPath}` }, 404);
      }
    }

    // Handle image upload if provided
    const data = { title, date, category, tags, description, source, imageAlt };
    const commits = [];

    if (body.image && body.image.base64 && body.image.ext) {
      const ext = String(body.image.ext).toLowerCase();
      if (b64ByteLength(body.image.base64) > MAX_IMAGE_BYTES) return json({ error: '图片超过 5MB 限制' }, 400);
      const imagePath = safeImagePath(date, slug, ext);
      if (!imagePath) return json({ error: '图片扩展名不支持' }, 400);

      let imageSha = null;
      if (await fileExists(imagePath, env)) {
        try {
          imageSha = (await github(`/repos/${env.GITHUB_REPO}/contents/${ghPath(imagePath)}?branch=main`, env)).sha;
        } catch { /* ignore */ }
      }
      await github(
        `/repos/${env.GITHUB_REPO}/contents/${ghPath(imagePath)}`,
        env,
        { method: 'PUT', body: { message: `feat: 上传梗图图片 ${imagePath}`, content: String(body.image.base64), ...(imageSha ? { sha: imageSha } : {}) } },
      );
      data.image = `/images/memes/${imagePath.split('/').pop()}`;
      commits.push(`上传图片 ${data.image}`);
    } else if (originalImage) {
      data.image = originalImage;
    }

    // Build markdown (UTF-8 safe base64)
    const md = buildFrontmatter(data) + '\n' + (bodyText ? bodyText + '\n' : '');

    // Write content
    await github(
      `/repos/${env.GITHUB_REPO}/contents/${ghPath(targetPath)}`,
      env,
      { method: 'PUT', body: { message: `${existingPath ? 'update: 更新' : 'feat: 新增'} ${category} ${title}`, content: toBase64(md), ...(sha ? { sha } : {}) } },
    );

    return json({ ok: true, path: targetPath, message: `已提交${commits.length ? ' · ' + commits.join(' · ') : ''}，CI 部署中（1-2 分钟上线）` });
  } catch (e) {
    return json({ error: e.message || '发布失败' }, 500);
  }
}