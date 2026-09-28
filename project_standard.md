在標準的軟體開發專案（如 Maven / Gradle + Node.js/Playwright）中，測試檔案有非常明確的**業界標準目錄規範**。

為了讓 AI 產出測試碼時自動加上正確的檔案路徑，你需要知道**這些檔案應該放在專案的什麼位置**，以及**如何在提示詞中指定路徑**。

---

### 一、 標準專案測試目錄結構規範

以下是結合 **Java 後端（JUnit）** 與 **前端（Playwright E2E）** 的標準專案結構：

```text
ReverseEngineering4Test/                  # 專案根目錄
├── pom.xml                               # Maven 依賴與建置設定檔
├── package.json                          # Node.js / Playwright 依賴設定檔
├── playwright.config.ts                  # Playwright 執行與瀏覽器環境設定檔
│
├── src/
│   ├── main/                             # 【正式程式碼】
│   │   ├── java/com/example/controller/
│   │   │   ├── UserBean.java
│   │   │   └── UserServlet.java          # 被測試的 Servlet
│   │   └── webapp/
│   │       ├── index.jsp                 # 前端頁面
│   │       ├── user.jsp
│   │       └── js/
│   │           └── clientValidation.js   # 前端驗證腳本
│   │
│   └── test/                             # 【後端與單元測試目錄】
│       ├── java/com/example/controller/  # 必須鏡像對應 main/java 的 Package 結構
│       │   └── UserServletTest.java      # 後端 JUnit 5 + Mockito 測試腳本
│       └── resources/                    # 測試專用資料庫/JSON 設定檔
│           └── test-data/
│               └── user_test_data.json   # 邊界值與參數化測試資料
│
└── e2e/                                  # 【前端 E2E / UI 自動化測試目錄】
    └── specs/
        └── userForm.spec.ts              # Playwright E2E 測試腳本

```

---

### 二、 檔案放置位置詳細說明

1. **後端單元/整合測試（JUnit 5 + Mockito）**
* **路徑**：`src/test/java/com/example/controller/UserServletTest.java`
* **原則**：必須嚴格**鏡像（Mirroring）** `src/main/java/` 的 Package 結構。這樣 JUnit 才能輕鬆存取套件級別（Package-private）的方法與變數。


2. **測試資料/配置文件（Test Data / Fixtures）**
* **路徑**：`src/test/resources/test-data/user_test_data.json`
* **原則**：將測試用的硬編碼資料（如 SQL Payload、超長字串、極限邊界值）獨立於程式碼之外，方便維護。


3. **前端 E2E 自動化測試（Playwright）**
* **路徑**：`e2e/specs/userForm.spec.ts` 或 `tests/e2e/userForm.spec.ts`
* **原則**：Playwright 預設會在專案根目錄下的 `e2e/` 或 `tests/` 資料夾尋找 `.spec.ts` 測試檔案。
* **設定檔**：`playwright.config.ts` 必須放在專案**根目錄**。



---

### 三、 如何將目錄規範加入提示詞（Prompt）？

你可以在原本的提示詞中加入 **「檔案目錄與命名規範 (File Path & Directory Rules)」** 區塊。

修訂後的提示詞補充範本如下（可直接加進上一步提示詞的第 1 點之前）：

```markdown
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

```

加了這段規範後，AI 生成的回答就會帶有明確的檔案路徑註記，方便你直接貼入 IDE（如 VS Code 或 IntelliJ IDEA）相對應的資料夾中執行。