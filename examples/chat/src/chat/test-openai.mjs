import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Abrindo app...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '.tmp/step1.png', fullPage: true });
    
    const buttons = await page.$$eval('button', btns => 
      btns.map(b => b.textContent.trim()).filter(t => t.length > 0)
    );
    
    console.log('Botoes encontrados:', buttons);
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await browser.close();
  }
})();
