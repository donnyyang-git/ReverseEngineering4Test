# 專案目錄
C:\工作台\ReverseEngineering4Test

# 提示詞
你是一位資深 SDET（自動化測試開發工程師）與 QA 架構師。請依據我提供的「微觀級別測試反向工程分析報告」，將其中的測試案例、等價類/邊界值（BVA）與防禦缺口，全面實作為完整且可執行的自動化測試腳本。

為了確保產出的測試碼具備生產級品質，請嚴格遵循以下規律：
1. **零預留位置原則 (Zero Placeholders)**：禁止使用 `// TODO`、`// 依此類推` 或省略斷言邏輯。所有測試方法必須具備完整的輸入設定、執行操作與精確斷言（Assertions）。
2. **追蹤對應 (Traceability)**：每個測試方法的名稱與 `@DisplayName` 必須明確註記報告中的案例 ID（如 `TC_USR_001`）與邊界情境。
3. **完全隔離與事件處理**：後端測試必須透過 Mockito 模擬完整的 Servlet 容器上下文；前端測試必須正確監聽瀏覽器事件（如 `dialog` / `alert`）與表單攔截狀態。

---
### 零、 專案檔案目錄與命名規範 (Directory Structure Rules)
請在產出每個測試腳本時，**於程式碼區塊最上方標註該檔案在專案中的相對路徑與檔名**：

1. **後端單元測試**：
   - 相對路徑：`src/test/java/com/example/controller/UserServletTest.java`
   - 套件宣告：`package com.example.controller;`

2. **前端 E2E 測試**：
   - 相對路徑：`e2e/userForm.spec.ts`

3. **Playwright 配置文件**：
   - 相對路徑：`playwright.config.ts`

4. **Maven 依賴設定**：
   - 相對路徑：`pom.xml`（僅提供 `<dependencies>` 區段）


### 請依序產出以下 3 項交付物：

#### 一、 後端單元與整合測試腳本 (Java + JUnit 5 + Mockito)
* **適用檔案**：分析報告中涉及的 Servlet / Controller 及後端業務類別。
* **技術棧**：JUnit 5 (`@ParameterizedTest`, `@DisplayName`), Mockito (`@Mock`, `@InjectMocks`, `ArgumentCaptor`), Servlet API (`HttpServletRequest`, `HttpServletResponse`, `RequestDispatcher`)。
* **涵蓋範圍**：
  1. **正向路徑 (Happy Path)**：驗證成功讀取參數、建構 Bean 並轉發（Forward）至指定 JSP。
  2. **逆向與繞過路徑 (Bypass Path)**：模擬繞過前端直接呼叫 API（傳送 `null`、空字串 `""`、純空白 `"   "`、超長字串）。
  3. **安全性與注入攻擊驗證**：傳入 XSS Payload (`<script>...`) 或 SQL 注入字串，斷言後端處置行為（例如是否轉義或丟出 Exception）。
* **斷言要點**：
  - 使用 `ArgumentCaptor` 擷取並斷言 `request.setAttribute("user", ...)` 物件內部的變數狀態。
  - 驗證 `RequestDispatcher.forward()` 被正確調用且路徑無誤。

#### 二、 前端 E2E / UI 自動化測試腳本 (TypeScript + Playwright)
* **適用檔案**：分析報告中的 HTML / JSP 表單與前端驗證 JS（如 `clientValidation.js`）。
* **技術棧**：Playwright (`@playwright/test`)。
* **涵蓋範圍**：
  1. **UI 阻擋與 Dialog 斷言**：測試必填欄位空白、Email 正則表達式失敗、姓名長度 $< 2$ 非空白字元時，監聽並斷言 `page.on('dialog')` 的跳窗訊息文字。
  2. **攔截驗證**：斷言表單提交事件被成功攔截（`event.preventDefault()`），頁面 URL 未發生改變。
  3. **成功提交**：填入合法資料並驗證頁面跳轉與結果展示。

#### 三、 測試配置與依賴清單 (Dependencies & Setup)
1. 提供執行後端測試所需的 Maven `pom.xml` 關鍵依賴（JUnit 5, Mockito, `javax.servlet-api` / `jakarta.servlet-api`）。
2. 提供執行 Playwright 的安裝與啟動指令 (`npx playwright test`)。

---

【待轉換之微觀反向工程報告】：
（檔案 ReverseEngineering4Test_01.md ）