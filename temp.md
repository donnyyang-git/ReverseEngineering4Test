
三、 Playwright 自動化測試腳本 (Test Scripts)
1. 語言/框架：使用 Playwright (TypeScript 或 Java，預設使用 TypeScript)。
2. 請根據「二、測試案例矩陣」中的核心案例，撰寫結構完整的 Playwright 腳本。
3. 語法要求：
- 使用 `page.locator()` 並優選語意化 Locators（如 `getByRole`, `getByLabel`, `getByTestId` 或具體 CSS 選擇器）。
- 包含明確的斷言 (`await expect(...)`)，驗證 URL 轉向、DOM 元素顯示與提示訊息。
- 腳本需加上清晰的註解說明步驟。