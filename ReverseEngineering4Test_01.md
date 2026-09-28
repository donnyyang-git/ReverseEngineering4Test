# 微觀級別（Micro-level）業務邏輯拆解與測試規劃：UserServlet/Index.jsp

**分析目標程式碼:**
1.  `C:\/工作台/ReverseEngineering4Test/js/clientValidation.js`: 前端客戶端驗證。
2.  `C:\/工作台/ReverseEngineering4Test/src/main/java/com/example/controller/UserServlet.java`: 後端伺服器端業務邏輯。

**分析核心假設:** 程式碼流為：瀏覽器 $\to$ `index.jsp` (包含表單) $\to$ `clientValidation.js` (前端攔截) $\to$ POST/GET Request to `/user` Servlet $\to$ `UserServlet` 處理 $\to$ Forward to `user.jsp`。
**關鍵發現:** 該應用程式的業務邏輯主要體現在參數讀取和傳遞（Bean填充），缺少明確的後端資料庫存儲與修改操作，故分析將聚焦於輸入參數驗證的完整性及狀態流程。

---

### 一、 輸入參數與狀態邊界解析 (Input & State Matrix)

#### 1. 輸入參數窮舉表
| 參數名稱 | 資料型態 | 可否為 Null / Empty | 正則/長度限制 | 預設值 | 隱含商業含意 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `username` (Form Payload) | String | **不能** Empty (JS檢查) | $\ge 2$ 非空白字元 (JS檢查) | N/A (Servlet預設為 "Guest") | 用於識別使用者身份，應為實體可辨識名稱。 |
| `email` (Form Payload) | String | **不能** Empty (JS檢查) | 必須符合標準 email 格式 (`user@domain.com`) (JS檢查) | N/A (Servlet預設為 "no-email@example.com") | 用於唯一識別與聯繫，業務上通常需要進行 Email 可用性驗證。 |
| `request` attributes | Object | N/A | N/A | `user` Bean (由伺服器生成) | 傳遞使用者操作結果或資料至前端展示層的數據載體。 |

#### 2. 狀態轉移矩陣 (State Machine)
由於提供的程式碼只包含讀取和顯示（Read-Only）功能，不涉及任何實際의寫入/修改（Write Operation），因此無法建立傳統業務流程的「變更前 $\to$ 觸發條件 $\to$ 變更後」狀態轉移矩陣。

**當前可分析的邏輯狀態 (ViewState):**
*   **初始狀態:** Web 應用啟動，Servlet `doGet` 被呼叫。
    $\Downarrow$
*   **執行路徑 (GET):** 程式碼自動創建一個預設 `UserBean` (`John Doe`, `john.doe@example.com`) $\to$ **View State: Display Mode**.
    $\Downarrow$
*   **執行路徑 (POST/GET):** 用戶提交表單，Servlet `doPost` 被呼叫。伺服器將接收到的參數填入新 Bean $\to$ **View State: Submitted Data Preview**.

---

### 二、 邏輯分支與條件組合解構 (Decision & Branch Coverage)

#### 1. 巢狀條件分解 (If/Else Nesting)
主要的業務邏輯判斷位於 `clientValidation.js` 中，包含一個三層次的嵌套檢查結構：

*   **外層檢查 (必填)：**
    ```javascript
    if (!username || !email) { ... }
    ```
    *   **短路邏輯:** 若 `!username` 為 True（即 `username` 為空或 `null`），則整個條件判斷為 True，程式碼會執行警報和阻止提交 (event.preventDefault())。剩餘的 email 檢查不會被評估。

*   **中層檢查 (Email Format)：**
    ```javascript
    if (!emailPattern.test(email)) { ... }
    ```
    *   此判斷只有在通過了外層必填檢查（即 `!username` 和 `!email` 皆為 False）之後才執行。

*   **內層檢查 (Username Length)：**
    ```javascript
    if (username.replace(/\s/g, '').length < 2) { ... }
    ```
    *   此判斷只有在前兩個條件都通過後才會評估，確保使用者輸入的姓名非空且長度 $\ge 2$。

#### 2. 邏輯真值表 (Truth Table)
針對三個核心驗證條件 $C_1$ (`username` empty), $C_2$ (`email` format), 和 $C_3$ (`username` length < 2)，建立組合表：

| $\mathbf{C_1}$: Username Empty | $\mathbf{C_2}$: Email Invalid | $\mathbf{C_3}$: User Name Too Short | 最終判斷結果 (JS) | 程式執行路徑 |
| :--- | :--- | :--- | :--- | :--- |
| **True** ($\text{Empty}$) | N/A | N/A | $!(\text{False})$ $\to$ **Fail** | 阻止提交，彈出「請填寫所有欄位...」錯誤。 (JS Line 15) |
| **False** ($\ne \text{Empty}$) | **True** (Invalid Format) | N/A | $!(\text{False}) \&\& !(\text{False})$ $\to$ $\text{Pass}$ $\to$ Fail | 阻止提交，彈出「電子信箱的格式有誤...」錯誤。 (JS Line 25) |
| **False** ($\ne \text{Empty}$) | **False** (Valid Format) | **True** ($< 2$) | $!(\text{False}) \&\& !(\text{False})$ $\to$ Pass $\to$ Fail | 阻止提交，彈出「姓名至少需要兩個非空白字元...」錯誤。 (JS Line 32) |
| **False** ($\ne \text{Empty}$) | **False** (Valid Format) | **False** ($\ge 2$) | $!(\text{False}) \&\& !(\text{False})$ $\to$ Pass $\to$ Pass | 執行表單提交，流程通過。 (JS Line 36) |

---

### 三、 多層次驗證與防禦缺口對照 (Multi-tier Validation Mapping)

| 業務規則/欄位 | 前端 (JS/UI) 是否驗證 | 後端 (Servlet/API) 是否驗證 | 資料庫 (Constraint/Trigger) 是否約束 | 繞過風險點 (如：缺乏後端驗證、SQLi、越權漏洞) |
| :--- | :--- | :--- | :--- | :--- |
| **`username`** (非空) | ✅ 是（必填） | ❌ 否 (Servlet只判斷 `null`) | ❓ 不知 (無 DB Code) | **高風險:** 可透過直接發送 HTTP POST/GET 請求，繞過 JavaScript 驗證。後端未檢查參數是否為 $\text{null}$ 或空字串（`username != null ? username : "Guest"`）。|
| **`email`** (格式) | ✅ 是 (Regex) | ❌ 否 (Servlet只判斷 `null`) | ❓ 不知 (無 DB Code) | **高風險:** 透過直接 API Call，繞過前端 Regex 驗證。後端未執行 Email 正則表達式檢查或域名的有效性檢查。|
| **`username`** (最小長度 $\ge 2$) | ✅ 是 ($\text{Length} \ge 2$ 非空白字元) | ❌ 否 | ❓ 不知 | **中風險:** 前端僅為 UX/UI 層級保護，不具備安全約束。攻擊者可直接設置 `username` 為單個或多個空格字串，後端仍接受傳入值。|
| **跨站腳本攻擊 (XSS)** | ❌ 否 | ❓ 不知 (未提供) | ? | **極高風險:** 若 `UserBean` 的屬性（尤其是 `username` 和 `email`）在 JSP (`user.jsp`) 中直接使用 EL 語法輸出（`<${user.username}>`），且沒有進行內容轉義，則存在 XSS 風險。|
| **SQL Injection (SQLi)** | ❌ 否 | ❓ 不知 | ? | **無法判定:** 由於 Servlet 程式碼中未出現任何資料庫操作語句 (e.g., JDBC, JPA)，因此无法評估 SQLi 的具體風險點。但若未來加入 DB 邏輯，必須使用參數化查詢。|

---

### 四、 異常鏈、交易與邊界分析 (Exception & Boundary Analysis)

#### 1. 等價類與極限邊界值測試 (BVA)
*   **`username` 欄位:**
    *   **有效等價類:** 包含字母和數字的標準使用者名稱 (`TestUser123`)。
    *   **無效等價類:**
        *   空字串 `""` 或 `null` (已被 JS 攔截)。
        *   單一空白字符 `" "` (JS 檢查失敗)。
        *   包含非法控制字符或 HTML/SQL Payload (`<script>alert(1)</script>`, `' OR 1=1 --`)。
    *   **極限邊界值:** 最小長度 $2$；最大長度 (理論上受伺服器限制，但前端未設置上限)。

*   **`email` 欄位:**
    *   **有效等價類:** 標準的 `user@domain.com` 格式。
    *   **無效等價類:**
        *   缺少 `@` 或域名 (`test.com`)。
        *   包含多個连续的 `@` 或 `.` 等非法字符結構。
        *   超長字串 (超出業務限制)。
    *   **極限邊界值:** 最小長度 $1$ (需通過 $\text{Regex}$ 過濾)；最大長度 ($\text{String.length()}$ 上限，但無明確業務上限定義)。

#### 2. 異常處理與交易 Rollback (Transaction Check)
*   **Exception 觸發點:**
    *   **受控 Exception:** `IOException` 和 `ServletException` (Servlet 簽名中宣告)。這代表 I/O 或 Servlet 級別的業務邏輯錯誤。
    *   **非受控 Exception:** 在當前代碼體中，未觀察到可能拋出 `RuntimeException` 的位置，但如果未來加入資料庫操作或複雜計算，則需注意此類異常。

*   **事務 (Transaction) 分析:**
    *   **Rollback 情況:** **無法分析。** 程式碼的業務邏輯僅限於參數讀取和 Bean 創建，未包含任何與數據庫 I/O 相關的 `commit` 或 `@Transactional` 標記。如果後續加入 DB 操作，必須使用標準的 Spring / Java EE 事務管理器來確保原子性 (Atomicity)。
    *   **孤兒資料風險:** **極高潛在風險。** 如果未來實作了多步驟交易（例如：創建訂單 $\to$ 更新庫存），但只在某個環節拋出異常，且未配置適當的 `try-catch-rollback` 機制，將極易發生「半寫入」導致數據不一致 (e.g., 訂單已生成，但庫存未扣除)。

---

### 五、 結構化測試用例生成 (Test Case Specification)

#### 用例集 A：正常流程驗證 (Success Path Validation)
1.  **測試案例 ID/名稱:** `TC_USR_001_SUCCESS_VALIDATION`
2.  **前置條件:** Web 頁面已加載。伺服器狀態為預設值（不需 Mock）。
3.  **精確輸入:**
    *   Method: POST
    *   Payload: `username=TestUserAlpha`, `email=test@valid-domain.co`
4.  **預期結果 (Expected Output):**
    *   HTTP Status Code: 200 OK
    *   Response Body/View State: `user.jsp` 應成功渲染，顯示用戶資料：Username = TestUserAlpha, Email = test@valid-domain.co。
    *   DB 最終狀態變更: 無 (Read Only)。
    *   Log紀錄或Exception訊息: Success log message。

#### 用例集 B：前端驗證失敗測試 (Client-Side Failure)
1.  **測試案例 ID/名稱:** `TC_USR_002_JS_FAIL_EMAIL`
2.  **前置條件:** Web 頁面已加載，JavaScript 可執行。
3.  **精確輸入:**
    *   Method: POST (模擬提交)
    *   Payload: `username=ValidName`, `email=invalid-email-format`
4.  **預期結果 (Expected Output):**
    *   HTTP Status Code: 200 OK (請求未發送至後端，瀏覽器層級攔截)。
    *   Response Body/View State: **不應有任何頁面變化。**
    *   DB 最終狀態變更: 無。
    *   Log紀錄或Exception訊息: 前端彈出警報：「電子信箱的格式有誤...」。

#### 用例集 C：後端參數注入攻擊測試 (Backend Injection Bypass)
1.  **測試案例 ID/名稱:** `TC_USR_003_BE_BYPASS_NULL`
2.  **前置條件:** Web 應用運行，繞過前端 JavaScript。
3.  **精確輸入:**
    *   Method: POST (直接調用 Servlet API)
    *   Payload: `username=`, `email=test@valid-domain.co` (模擬 JS 被禁用或被攔截)
4.  **預期結果 (Expected Output):**
    *   HTTP Status Code: 200 OK。
    *   Servlet 處理：當前代碼邏輯會將空字串 `""` 讀取為參數，並執行 `user.setUsername("")` $\to$ **此為潛在漏洞點，應增加後端對非空/有效值的檢查**。
    *   DB 最終狀態變更: 無。
    *   Log紀錄或Exception訊息: 系統應記錄警告：接收到無效的 Username 參數。

---
*End of Analysis.*