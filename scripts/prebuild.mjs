import { rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// 清理 public/images/templates 残留目录（Windows exFAT 可能无法删除）
const dir = 'public/images/templates';
if (existsSync(dir)) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // Windows 文件锁时忽略，Vite 会跳过空目录
  }
}

// 生成词林语义索引（摸鱼猜词通用相似度数据）
execFileSync(process.execPath, ['scripts/build-cilin.mjs'], { stdio: 'inherit' });
