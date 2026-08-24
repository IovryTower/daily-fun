import { json, createToken, constantTimeEq } from './_lib.js';

export async function onRequestPost({ request, env }) {
  try {
    if (!env.ADMIN_PASSWORD || !env.ADMIN_SECRET) {
      return json({ error: '管理功能未配置' }, 503);
    }
    const { password } = await request.json();
    if (!password || !constantTimeEq(password, env.ADMIN_PASSWORD)) {
      return json({ error: '密码错误' }, 401);
    }
    const token = await createToken(env);
    return json({ ok: true, token });
  } catch (e) {
    return json({ error: e.message || '请求错误' }, 400);
  }
}