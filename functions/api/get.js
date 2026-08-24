import { json, github, auth, parseFrontmatter, ghPath } from './_lib.js';

export async function onRequestGet({ request, env }) {
  const denied = await auth(request, env);
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path') || '';
    if (!/^content\/fun\/[\p{L}\p{N}._-]+\.md$/u.test(path)) {
      return json({ error: '非法的内容路径' }, 400);
    }
    const content = await github(`/repos/${env.GITHUB_REPO}/contents/${ghPath(path)}?branch=main`, env);
    const md = atob(content.content);
    const { data, body } = parseFrontmatter(md);
    return json({ ok: true, path, sha: content.sha, data, body });
  } catch (e) {
    return json({ error: e.message || '读取失败' }, 500);
  }
}