// File Path: e2e/userForm.spec.ts
import { test, expect, Page, Locator } from '@playwright/test';

/**
 * @fileoverview 修正路由與路徑對齊的完整 E2E 自癒測試腳本
 */

// ⚙️ 專案路徑設定：請根據你的真實專案 Context Path 進行修改
// 如果你的專案網址是 http://localhost:8080/MyForm/index.jsp，請改成 '/MyForm/index.jsp'
const PROJECT_FORM_PATH = 'http://localhost:8080/TomcatServletDemo/user'; 
// ⚡ 語意化定位器定義
const FORM_ELEMENTS = {
    USERNAME: (scope: Page | Locator) => scope.getByLabel(/使用者名稱|姓名|Username/i)
        .or(scope.getByPlaceholder(/請輸入使用者名稱|姓名/i))
        .or(scope.locator('#username'))
        .or(scope.locator('input[name="username"]'))
        .or(scope.locator('input[name="name"]'))
        .first(),

    EMAIL: (scope: Page | Locator) => scope.getByLabel(/電子信箱|Email/i)
        .or(scope.getByPlaceholder(/請輸入電子信箱|Email/i))
        .or(scope.locator('#email'))
        .or(scope.locator('input[name="email"]'))
        .first(),

    SUBMIT_BUTTON: (scope: Page | Locator) => scope.getByRole('button', { name: /提交|送出|Submit/i })
        .or(scope.locator('button[type="submit"]'))
        .or(scope.locator('input[type="submit"]'))
        .first()
};

/**
 * 智慧定位器調度器：自動判斷要在主頁面找、還是在 iframe 裡找
 */
async function getActiveScope(page: Page): Promise<Page | Locator> {
    const mainVisible = await FORM_ELEMENTS.USERNAME(page).isVisible();
    if (mainVisible) return page;

    const firstIframe = page.frameLocator('iframe').first();
    const iframeVisible = await FORM_ELEMENTS.USERNAME(firstIframe).isVisible();
    if (iframeVisible) return firstIframe;

    return page;
}

test.beforeEach(async ({ page }) => {
    // 1. 導向目標網頁
    await page.goto(PROJECT_FORM_PATH, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

    try {
        // 2. 智慧防禦：檢查表單主要欄位是否順利出現
        const scope = await getActiveScope(page);
        await expect(FORM_ELEMENTS.USERNAME(scope)).toBeVisible({ timeout: 5000 });
    } catch (error) {
        const currentUrl = page.url();
        const bodyText = await page.innerText('body');
        
        console.error('\n❌ [Playwright 路由阻斷診斷提示]：');
        console.error(`📌 當前瀏覽器網址 (URL): ${currentUrl}`);
        
        if (bodyText.includes('Apache Tomcat')) {
            console.error('🚨 偵測到網頁仍停留在【Tomcat 預設歡迎首頁】！');
            console.error(`🚨 請檢查：你的表單網址是否帶有專案名稱？(例如: http://localhost:8080/你的專案名${PROJECT_FORM_PATH})`);
            console.error(`🚨 解決方法：請直接修改腳本頂部的 'PROJECT_FORM_PATH' 常數，對齊你的真實路徑。\n`);
        } else {
            console.error(`📌 當前網頁文字快照:\n"${bodyText.substring(0, 150).trim()}..."\n`);
        }
        throw error;
    }
});

test.describe('User Form Submission E2E Validation Tests', () => {

    /**
     * 用例 ID: TC_USR_001 - 正常提交成功測試 (Happy Path)
     */
    test('TC_USR_001 | Should successfully submit with valid credentials', async ({ page }) => {
        const scope = await getActiveScope(page);
        const username = 'ValidUserAlpha';
        const email = 'valid.user@example.com';

        await FORM_ELEMENTS.USERNAME(scope).fill(username);
        await FORM_ELEMENTS.EMAIL(scope).fill(email);
        await FORM_ELEMENTS.SUBMIT_BUTTON(scope).click();
        
        // 斷言成功轉場：相容帶有 Context Path 的跳轉路徑
        await expect(page).toHaveURL(/user\.jsp|dashboard|success|result/i);
    });

    /**
     * 用例 ID: TC_USR_002 - 前端驗證失敗測試：Email 格式錯誤
     */
    test('TC_USR_002 | Should block submission when email format is invalid', async ({ page }) => {
        const scope = await getActiveScope(page);

        await FORM_ELEMENTS.USERNAME(scope).fill('ValidUser');
        await FORM_ELEMENTS.EMAIL(scope).fill('invalid-email-format');

        const dialogPromise = page.waitForEvent('dialog');
        await FORM_ELEMENTS.SUBMIT_BUTTON(scope).click();
        
        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('電子信箱的格式有誤');
        await dialog.accept(); 
        
        // 驗證未跳轉
        expect(page.url()).toContain(PROJECT_FORM_PATH);
    });

    /**
     * 異常驗證測試組：使用者名稱防禦
     */
    test.describe('Failure Validation Tests', () => {

        // Test Case C1: Username 為空
        test('TC_USR_003a | Should block submission when username is missing (Null/Empty)', async ({ page }) => {
            const scope = await getActiveScope(page);

            await FORM_ELEMENTS.USERNAME(scope).fill('');
            await FORM_ELEMENTS.EMAIL(scope).fill('valid@test.com');

            const dialogPromise = page.waitForEvent('dialog');
            await FORM_ELEMENTS.SUBMIT_BUTTON(scope).click();
            
            const dialog = await dialogPromise;
            expect(dialog.message()).toMatch(/請填寫所有欄位|不能為空|必填/);
            await dialog.accept();
        });
        
        // Test Case C2: Username 長度不足
        test('TC_USR_003b | Should block submission when username length is less than 2', async ({ page }) => {
            const scope = await getActiveScope(page);

            await FORM_ELEMENTS.USERNAME(scope).fill('A');
            await FORM_ELEMENTS.EMAIL(scope).fill('valid@test.com');

            const dialogPromise = page.waitForEvent('dialog');
            await FORM_ELEMENTS.SUBMIT_BUTTON(scope).click();

            const dialog = await dialogPromise;
            expect(dialog.message()).toContain('姓名至少需要兩個非空白字元');
            await dialog.accept();
        });
    });
});
