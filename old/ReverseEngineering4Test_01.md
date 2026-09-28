# 逆向邏輯分析與測試規劃報告 (Reverse Engineering & Test Plan)

**專案名稱：** Servlet/JSP User Data Handling
**目標文件路徑：** `C:\工作台\ReverseEngineering4Test\ReverseEngineering4Test_01.md`
**角色定位：** 資深 QA 架構師 (Java Legacy Code & Playwright Automation)

---

## 一、 測試規劃 (Test Plan & Strategy)

本專案是一個典型的 Web 2.0 / Struts-style 的資料呈現流程，核心邏輯圍繞著使用 `UserBean` 物件來承載和展示使用者資訊。由於程式碼結構相對簡單，但其「假設」的業務規則（如：使用者必須有唯一且有效的Email）並未在程式碼層面強制驗證。

### 1. 核心業務邏輯提取 (Core Business Logic)
*   **目標功能 (Goal):** 展示或更新一個代表使用者的基本資料集合 (`Username` 和 `Email`)，並將其展示到 JSP 介面上。
*   **輸入/輸出 (I/O):**
    *   **GET Request:** 當用戶直接訪問 `/user` 時，Servlet 會硬編碼（Hardcode）一個預設的測試使用者資料 (`John Doe`, `john.doe@example.com`)，無需任何外部輸入。
    *   **POST Request:** 用戶透過表單提交 (Form Submission) 包含 `username` 和 `email` 參數。
    *   **狀態變化：** 使用者 Bean (`UserBean`) 的屬性（`username`, `email`）在伺服器端被填充，並以 `request.setAttribute("user", user)` 的形式進入 JSP 層級的 Request Scope。
    *   **隱含規則：** 程式碼假設任何透過 POST 傳入的資料都是有效且可直接用於展示或儲存的（缺乏 `@Valid` 或業務層驗證）。

### 2. 潛在風險評估 (Potential Risks & Deficiencies)
| 風險點 (Risk Point) | 定位 (Location) | 描述 (Description) | 影響等級 (Impact) |
| :--- | :--- | :--- | :--- |
| **XSS 注入風險** | `UserServlet.java` / JSP View | 所有從 Request Param (`username`, `email`) 讀取後，未經過實體編碼（Encoding）即用於 JSP 展示。這可能導致攻擊者注入惡意腳本 (Script)。 | Critical |
| **缺少業務層驗證** | `UserServlet.java` | 對於 POST 接收到的參數 (`username`, `email`) 沒有進行非空、格式匹配（Email Regex）、長度限制等任何資料有效性檢查。極易接受無效或惡意輸入。 | High |
| **GET/POST 混用邏輯** | `UserServlet.java` | GET 方法硬編碼了測試資料，若業務流程要求每次訪問都應根據 Session 或 Auth Context 來獲取使用者資料，此處的設計是缺陷。 | Medium |
| **URL 編碼處理不完善** | Servlet/JSP 層 | 雖然使用了 `request.setCharacterEncoding("UTF-8")`，但在實務中仍需警惕瀏覽器或客戶端傳入非標準編碼格式造成資料損壞。 | Low-Medium |

### 3. 測試邊界定義 (Test Boundary Definition)
*   **前端介面驗證 (Front-end/Playwright):**
    *   頁面是否正確導航至 `/user` 頁面。
    *   表單提交機制是否正常（Button Click）。
    *   輸入欄位（Username, Email）的預設佔位符和標籤文字是否正確顯示。
    *   在執行失敗時，前端應捕獲並提示錯誤訊息 (雖然現有程式碼沒有定義此處)。
*   **後端 Servlet / 資料庫驗證 (Backend/Playwright-API):**
    *   **核心測試點：** 參數的業務邏輯驗證（Validation）。必須在 Servlet 層級攔截和處理不合格的輸入。
    *   資料傳遞介面驗證：確保 `UserBean` 的 setter 方法能正確接收並儲存所有預期的字串格式。
    *   (如果連接了 DB)：權限檢查 (Authorization Check)，確保只有特定角色才能執行此操作。

---

## 二、 測試案例矩陣 (Test Cases Matrix)

| 測試案例 ID | 測試類別 | 案例名稱/情境 | 前置條件 | 輸入資料/操作 | 預期結果 (含畫面與資料庫變化) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-001** | **正常路徑 (Happy Path)** | 提交標準有效使用者資訊。 | - | Username: `testuser` / Email: `valid@domain.com`；點擊提交按鈕。 | JSP 頁面顯示用戶名為 `testuser`，Email 為 `valid@domain.com`；資料傳遞成功。 (需新增後端驗證邏輯) |
| **TC-002** | **正常路徑 (Happy Path)** | 使用 GET 預設導航流程測試。 | - | 直接訪問 `/user` URL。 | JSP 頁面顯示硬編碼的預設資料 (`John Doe`, `john.doe@example.com`)；不觸發資料庫寫入或變更。 |
| **TC-003** | **異常路徑 (Exception Path)** | Username 參數缺失（Null）。 | - | Username: 空值 / Email: `valid@domain.com`；點擊提交按鈕。 | Servlet 應攔截 Null，並在前端提示「使用者名稱不可為空」。預期資料不更新或回退到上一個有效狀態。|
| **TC-004** | **異常路徑 (Exception Path)** | Email 參數格式錯誤（Invalid Format）。 | - | Username: `testuser` / Email: `invalid-email!`；點擊提交按鈕。 | Servlet 應執行 Email 正則表達式驗證，前端提示「電子郵件格式無效」。|
| **TC-005** | **邊界與極端條件 (Edge Cases)** | Username 達到最大長度限制。 | - | Username: 包含 N 個字符的最大字串；Email: `a@b.com`。 | 系統應正常接受該長度，且不會導致資料截斷或伺服器錯誤。|
| **TC-006** | **邊界與極端條件 (Edge Cases)** | 輸入特殊字元（例如：`<script>`）。 | - | Username: `<script>alert(1)</script>` / Email: `test@domain.com`；點擊提交按鈕。 | 頁面展示時必須進行 HTML Entity 編碼，防止 XSS 執行；網頁上應顯示原始字串，而非彈窗。|
| **TC-007** | **邊界與極端條件 (Edge Cases)** | 嘗試使用無效的 POST 方法（例如：只傳送 Username）。 | - | Username: `testuser` / Email: 未提交參數。 | Servlet 應處理缺少的必填參數，並友善地提供預設值或錯誤提示，而非崩潰。|