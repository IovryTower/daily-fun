import { chromium } from 'playwright';
import { pickDailyTarget } from '../src/lib/fishGame.ts';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto('http://localhost:4321/moyu/', { waitUntil: 'domcontentloaded' });
  // 让模块脚本执行完（startGame('daily')）再读取初始状态
  await page.waitForTimeout(200);

  // 每日题模式
  const hint = await page.textContent('#hint-theme');
  const dailyBadge = (await page.textContent('#mode-daily') || '').trim();
  console.log('Daily badge:', dailyBadge);
  console.log('Hint theme:', hint?.trim());

  // 随机一题 → 应显示随机 badge + 回到今日题按钮
  await page.click('#new-game');
  await page.waitForTimeout(100);
  const randomBadge = (await page.textContent('#mode-random') || '').trim();
  const backVisible = await page.locator('#back-daily').isVisible();
  console.log('After random:', randomBadge, '| back-daily visible:', backVisible);

  // 回到今日题 → 还是每日 badge
  await page.click('#back-daily');
  await page.waitForTimeout(100);
  const dailyBadge2 = (await page.textContent('#mode-daily') || '').trim();
  console.log('Back to daily:', dailyBadge2);

  // 猜词 + 命中后检查分享/纪录：直接猜当天的每日目标词
  // 先猜一个干扰词验证非命中反馈，再用真实目标命中
  await page.fill('#guess-input', '苹果');
  await page.click('#guess-form button[type="submit"]');
  await page.waitForTimeout(80);
  const missPct = (await page.textContent('#result-pct') || '').trim();
  const missHit = !(await page.locator('#success-banner').getAttribute('class'))?.includes('hidden');
  console.log('Miss guess pct:', missPct, '| hit banner visible:', missHit);

  const target = pickDailyTarget(new Date());
  await page.fill('#guess-input', target);
  await page.click('#guess-form button[type="submit"]');
  await page.waitForTimeout(100);
  const hit = !(await page.locator('#success-banner').getAttribute('class'))?.includes('hidden');
  console.log('Hit:', hit, '| target:', target);
  if (hit) {
    console.log('Best line:', (await page.textContent('#success-best') || '').trim());
    await page.click('#share-btn');
    await page.waitForTimeout(100);
    const shareText = (await page.textContent('#share-text') || '').trim();
    console.log('Share text:');
    console.log(shareText.split('\n').slice(0, 3).join('\n'));
    const shareVisible = await page.locator('#share-text').isVisible();
    console.log('Share box visible:', shareVisible);
  }

  const historyCount = await page.locator('#guess-history > div').count();
  console.log('History entries:', historyCount);
  const topWord = (await page.locator('#guess-history > div:first-child span').first().textContent())?.trim();
  console.log('History top by pct:', topWord);

  // 查看答案：需输入「确认」才显示
  await page.click('#reveal-btn');
  await page.waitForTimeout(80);
  const answerRowVisible = await page.locator('#answer-row').isVisible();
  await page.fill('#answer-input', '错了');
  await page.click('#answer-confirm');
  await page.waitForTimeout(50);
  const stillBlocked = await page.locator('#reveal-banner').isHidden();
  await page.fill('#answer-input', '确认');
  await page.click('#answer-confirm');
  await page.waitForTimeout(80);
  const revealVisible = await page.locator('#reveal-banner').isVisible();
  const revealWord = (await page.textContent('#reveal-word') || '').trim();
  console.log('Answer row visible:', answerRowVisible, '| wrong try blocked:', stillBlocked, '| revealed:', revealVisible, revealWord);

  // 注入"昨天"的记录并刷新，验证昨日回顾面板
  await page.evaluate(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const key = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
    localStorage.setItem('moyu-daily', JSON.stringify({
      [key]: { date: key, target: '大雨', attempts: 3, solved: true, pcts: [0, 62, 100] },
    }));
    localStorage.setItem('moyu-streak', JSON.stringify({ last: key, n: 3 }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(200);
  const streakText = (await page.textContent('#streak-badge') || '').trim();
  console.log('Streak badge:', streakText);
  const yesterdayBtnVisible = await page.locator('#yesterday-btn').isVisible();
  console.log('Yesterday btn visible:', yesterdayBtnVisible);
  if (yesterdayBtnVisible) {
    await page.click('#yesterday-btn');
    await page.waitForTimeout(100);
    const panelVisible = await page.locator('#yesterday-panel').isVisible();
    const yesterdayBody = (await page.textContent('#yesterday-body') || '').trim().replace(/\s+/g, ' ');
    console.log('Panel visible:', panelVisible);
    console.log('Yesterday body:', yesterdayBody.slice(0, 80));
  }

  console.log('JS errors:', errors.length ? errors : 'none');
  await browser.close();
})();