import { json, github, auth } from './_lib.js';

export async function onRequestGet({ request, env }) {
  const denied = await auth(request, env);
  if (denied) return denied;

  try {
    const tree = await github(`/repos/${env.GITHUB_REPO}/git/trees/main?recursive=1`, env);
    const items = (tree.tree || [])
      .filter((t) => t.type === 'blob' && t.path.startsWith('content/fun/') && t.path.endsWith('.md'))
      .map((t) => ({ path: t.path, sha: t.sha, name: t.path.split('/').pop() }))
      .sort((a, b) => (a.name < b.name ? 1 : -1));
    return json({ ok: true, items });
  } catch (e) {
    return json({ error: e.message || '列表获取失败' }, 500);
  }
}