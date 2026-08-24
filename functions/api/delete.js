import { json, github, auth, ghPath } from './_lib.js';

export async function onRequestPost({ request, env }) {
  const denied = await auth(request, env);
  if (denied) return denied;

  try {
    const { path } = await request.json();
    if (!/^content\/fun\/[\p{L}\p{N}._-]+\.md$/u.test(path)) {
      return json({ error: '非法的内容路径' }, 400);
    }

    const existing = await github(`/repos/${env.GITHUB_REPO}/contents/${ghPath(path)}?branch=main`, env);
    if (!existing || !existing.sha) {
      return json({ error: `内容不存在: ${path}` }, 404);
    }

    await github(
      `/repos/${env.GITHUB_REPO}/contents/${ghPath(path)}`,
      env,
      { method: 'DELETE', body: { message: `chore: 删除 ${path}`, sha: existing.sha } },
    );

    return json({ ok: true, message: `已删除 ${path}，CI 部署中` });
  } catch (e) {
    return json({ error: e.message || '删除失败' }, 500);
  }
}