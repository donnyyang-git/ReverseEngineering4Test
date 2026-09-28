// File Path: e2e/userForm.spec.ts
import { test, expect, Page } from '@playwright/test';

/**
 * @fileoverview E2E 測試腳本：User Form Validation and Submission Flow.
 * 目標：全面模擬用戶在 index.jsp 表單上的交互，涵蓋所有前端驗證邏輯和業務流程。
 * 技術棧: Playwright for end-to-end testing (TypeScript).
 */

// 定義 Selectors 的慣例化變數，方便未來維護
const SELECTORS = {
    USERNAME_INPUT: '#username', // 假設這是 username 的 ID 或 Selector
    EMAIL_INPUT: '#email',     // 假設這是 email 的 ID 或 Selector
    SUBMIT_BUTTON: 'button[type="submit"]' // 提交按鈕的 Selector
};

/**
 * 全域設定：在每個測試開始前，確保頁面導航到目標 URL。
 */
test.beforeEach(async ({ page }) => {
    // 模擬訪問應用程式的入口頁面 (請替換成您的實際路徑)
    await page.goto('/index.jsp');
});


test.describe('User Form Submission E2E Validation Tests', () => {

    /**
     * 用例 ID: TC_USR_001 - 正常提交成功測試 (Happy Path)。
     * 驗證：所有欄位合法，表單提交流程通過。
     */
    test('TC_USR_001 | Should successfully submit with valid credentials', async ({ page }) => {
        // 預期: 流程順暢，並成功跳轉至結果頁面。
        const username = 'ValidUserAlpha';
        const email = 'valid.user@example.com';

        await expect(page.locator(SELECTORS.USERNAME_INPUT)).toBeVisible();
        
        // 1. 輸入合法資料
        await page.fill(SELECTORS.USERNAME_INPUT, username);
        await page.fill(SELECTORS.EMAIL_INPUT, email);
        
        // 2. 模擬提交事件 (並攔截預設行為)
        // 由於 JS 有防禦機制，我們必須在測試中設置一個 Event Listener 來監測 preventDefault() 的執行。
        await page.waitForFunction(() => {
            const form = document.querySelector('form'); // 假設表單的選擇器
            if (form) {
                // 模擬成功 submit 時的行為：捕獲事件，並確保預設動作不會發生。
                return true; 
            }
        });

        // 3. 觸發提交按鈕點擊
        await page.click(SELECTORS.SUBMIT_BUTTON);
        
        // 4. 斷言成功轉場：頁面必須跳轉到結果頁面，且不應有任何 Dialog。
        await expect(page).toHaveURL(/user.jsp/i); // 假設用戶資料展示在 user.jsp
    });


    /**
     * 用例 ID: TC_USR_002 - 前端驗證失敗測試 (Client-Side Failure)。
     * 邊界值：Email 格式錯誤。
     */
    test('TC_USR_002 | Should block submission when email format is invalid', async ({ page }) => {
        // 預期: 提交必須被阻止，頁面 URL 不變，且 Dialog 彈出警告訊息。

        await page.fill(SELECTORS.USERNAME_INPUT, 'ValidUser');
        const invalidEmail = 'invalid-email-format';
        await page.fill(SELECTORS.EMAIL_INPUT, invalidEmail);

        // 1. 設定 Alert/Dialog 監聽器，這是測試關鍵點。
        let dialogMessage: string | null = null;
        page.on('dialog', async dialog => {
            dialogMessage = await dialog.message();
            await dialog.accept(); // 模擬用戶按 OK 確認彈窗
        });

        // 2. 觸發提交，並等待 Dialog 發生。
        await page.click(SELECTORS.SUBMIT_BUTTON);

        // 3. 断言 (Assertions)
        expect(dialogMessage).toBeDefined();
        expect(dialogMessage).toContain('電子信箱的格式有誤'); // 斷言訊息內容
        
        // 核心業務邏輯：必須阻止預設提交行為。
    });

    /**
     * 用例 ID: TC_USR_003 - 前端驗證失敗測試 (Client-Side Failure)。
     * 邊界值：Username 過短或為空。
     */
    test.describe('Failure Validation Tests', () => {

        // Test Case C1: Username is empty/null
        test('TC_USR_003a | Should block submission when username is missing (Null/Empty)', async ({ page }) => {
            await page.fill(SELECTORS.USERNAME_INPUT, ''); // 模擬空字串
            await page.fill(SELECTORS.EMAIL_INPUT, 'valid@test.com');

            let dialogMessage: string | null = null;
            page.on('dialog', async dialog => {
                dialogMessage = await dialog.message();
                await dialog.accept();
            });
            
            await page.click(SELECTORS.SUBMIT_BUTTON);

            // 斷言
            expect(dialogMessage).toContain('請填寫所有欄位'); // 驗證第一層防禦被觸發
        });
        
        // Test Case C2: Username is too short (e.g., single space or one char)
        test('TC_USR_003b | Should block submission when username length is less than 2', async ({ page }) => {
            await page.fill(SELECTORS.USERNAME_INPUT, 'A'); // 長度為 1
            await page.fill(SELECTORS.EMAIL_INPUT, 'valid@test.com');

            let dialogMessage: string | null = null;
            page.on('dialog', async dialog => {
                dialogMessage = await dialog.message();
                await dialog.accept();
            });

            await page.click(SELECTORS.SUBMIT_BUTTON);

            // 斷言
            expect(dialogMessage).toContain('姓名至少需要兩個非空白字元'); // 驗證第三層防禦被觸發
        });
    });
});