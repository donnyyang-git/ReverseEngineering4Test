# 一. 目錄結構
 tree /F 
列出資料夾 PATH
磁碟區序號為 CA09-6223
C:.
│  .classpath
│  .project
│  GUIDE.md
│  pom.xml
│  prompt_01.md
│  README.md
│  request.md
│  
├─.vscode
│      extensions.json
│      launch.json
│      
├─src
│  └─main
│      ├─java
│      │  └─com
│      │      └─example
│      │          ├─controller
│      │          │      UserServlet.java
│      │          │      
│      │          └─model
│      │                  UserBean.java
│      │                  
│      └─webapp
│          │  index.jsp
│          │  
│          └─WEB-INF
│              │  web.xml
│              │  
│              └─views
│                      user.jsp
│                      
└─target
    │  TomcatServletDemo.war
    │  
    ├─classes
    │  └─com
    │      └─example
    │          ├─controller
    │          │      UserServlet.class
    │          │      
    │          └─model
    │                  UserBean.class
    │                  
    ├─generated-sources
    │  └─annotations
    ├─maven-archiver
    │      pom.properties
    │      
    ├─maven-status
    │  └─maven-compiler-plugin
    │      └─compile
    │          └─default-compile
    │                  createdFiles.lst
    │                  inputFiles.lst
    │                  
    └─TomcatServletDemo
        │  index.jsp
        │  
        ├─META-INF
        └─WEB-INF
            │  web.xml
            │  
            ├─classes
            │  └─com
            │      └─example
            │          ├─controller
            │          │      UserServlet.class
            │          │      
            │          └─model
            │                  UserBean.class
            │                  
            ├─lib
            │      jstl-1.2.jar
            │      
            └─views
                    user.jsp

# 提示詞
你現在是一位精通 Java 遺留系統（Legacy Code）逆向工程與 Playwright 自動化測試的資深 QA 架構師。

我目前有一個缺乏規格文件與測試案例的舊專案。我想請你針對我提供的原始碼（包含 Servlet、JSP 或 DAO）進行「逆向邏輯分析」，幫我建立第一道黑箱/灰箱防禦網。

【分析與產出的目標】
請依序產出以下三個維度的內容：

一、 測試規劃 (Test Plan & Strategy)
1. 核心業務邏輯提取：分析這段程式碼的核心功能、輸入/輸出、狀態變化與隱含的商業規則。
2. 潛在風險評估：列出程式碼中缺乏驗證、可能有 Exception 或邊界處理不當的風險點。
3. 測試邊界定義：指出哪些流程屬於前端介面驗證、哪些屬於後端 Servlet / 資料庫驗證。

二、 測試案例矩陣 (Test Cases Matrix)
請以 Markdown 表格呈現，包含以下類型的測試案例：
- 正常路徑 (Happy Path)：主要功能順利執行的流程。
- 異常路徑 (Exception Path)：參數缺失、格式錯誤、資料庫查無資料或伺服器異常。
- 邊界與極端條件 (Edge Cases)：空值 (Null/Empty)、特殊字元、長度限制或極端數值。

表格欄位需包含：
`測試案例 ID` | `測試類別` | `案例名稱/情境` | `前置條件` | `輸入資料/操作` | `預期結果 (含畫面與資料庫變化)`

三、 Playwright 自動化測試腳本 (Test Scripts)
1. 語言/框架：使用 Playwright (TypeScript 或 Java，預設使用 TypeScript)。
2. 請根據「二、測試案例矩陣」中的核心案例，撰寫結構完整的 Playwright 腳本。
3. 語法要求：
   - 使用 `page.locator()` 並優選語意化 Locators（如 `getByRole`, `getByLabel`, `getByTestId` 或具體 CSS 選擇器）。
   - 包含明確的斷言 (`await expect(...)`)，驗證 URL 轉向、DOM 元素顯示與提示訊息。
   - 腳本需加上清晰的註解說明步驟。

--------------------------------------------------
【以下是我的舊程式碼原始碼目錄位置】
C:\工作台\ReverseEngineering4Test\

【以下是我的舊程式碼原始碼目錄檔案結構】
C:\工作台\ReverseEngineering4Test\

│  .classpath
│  .project
│  GUIDE.md
│  pom.xml
│  prompt_01.md
│  README.md
│  request.md
│  
├─.vscode
│      extensions.json
│      launch.json
│      
├─src
│  └─main
│      ├─java
│      │  └─com
│      │      └─example
│      │          ├─controller
│      │          │      UserServlet.java
│      │          │      
│      │          └─model
│      │                  UserBean.java
│      │                  
│      └─webapp
│          │  index.jsp
│          │  
│          └─WEB-INF
│              │  web.xml
│              │  
│              └─views
│                      user.jsp
│                      
└─target
    │  TomcatServletDemo.war
    │  
    ├─classes
    │  └─com
    │      └─example
    │          ├─controller
    │          │      UserServlet.class
    │          │      
    │          └─model
    │                  UserBean.class
    │                  
    ├─generated-sources
    │  └─annotations
    ├─maven-archiver
    │      pom.properties
    │      
    ├─maven-status
    │  └─maven-compiler-plugin
    │      └─compile
    │          └─default-compile
    │                  createdFiles.lst
    │                  inputFiles.lst
    │                  
    └─TomcatServletDemo
        │  index.jsp
        │  
        ├─META-INF
        └─WEB-INF
            │  web.xml
            │  
            ├─classes
            │  └─com
            │      └─example
            │          ├─controller
            │          │      UserServlet.class
            │          │      
            │          └─model
            │                  UserBean.class
            │                  
            ├─lib
            │      jstl-1.2.jar
            │      
            └─views
                    user.jsp



# 提示詞

目前的目錄是C:\工作台\ReverseEngineering4Test，你需要讀取目錄下原始碼檔案內容(目錄下檔案見reverse_do.md)，  

你現在是一位精通 Java 遺留系統（Legacy Code）逆向工程與 Playwright 自動化測試的資深 QA 架構師。

我目前有一個缺乏規格文件與測試案例的舊專案。我想請你針對我提供的原始碼（包含 Servlet、JSP 或 DAO）進行「逆向邏輯分析」，幫我建立第一道黑箱/灰箱防禦網。

【分析與產出的目標】
請依序產出以下三個維度的內容：

一、 測試規劃 (Test Plan & Strategy)
1. 核心業務邏輯提取：分析這段程式碼的核心功能、輸入/輸出、狀態變化與隱含的商業規則。
2. 潛在風險評估：列出程式碼中缺乏驗證、可能有 Exception 或邊界處理不當的風險點。
3. 測試邊界定義：指出哪些流程屬於前端介面驗證、哪些屬於後端 Servlet / 資料庫驗證。

二、 測試案例矩陣 (Test Cases Matrix)
請以 Markdown 表格呈現，包含以下類型的測試案例：
- 正常路徑 (Happy Path)：主要功能順利執行的流程。
- 異常路徑 (Exception Path)：參數缺失、格式錯誤、資料庫查無資料或伺服器異常。
- 邊界與極端條件 (Edge Cases)：空值 (Null/Empty)、特殊字元、長度限制或極端數值。

表格欄位需包含：
`測試案例 ID` | `測試類別` | `案例名稱/情境` | `前置條件` | `輸入資料/操作` | `預期結果 (含畫面與資料庫變化)`

三、 Playwright 自動化測試腳本 (Test Scripts)
1. 語言/框架：使用 Playwright (TypeScript 或 Java，預設使用 TypeScript)。
2. 請根據「二、測試案例矩陣」中的核心案例，撰寫結構完整的 Playwright 腳本。
3. 語法要求：
   - 使用 `page.locator()` 並優選語意化 Locators（如 `getByRole`, `getByLabel`, `getByTestId` 或具體 CSS 選擇器）。
   - 包含明確的斷言 (`await expect(...)`)，驗證 URL 轉向、DOM 元素顯示與提示訊息。
   - 腳本需加上清晰的註解說明步驟。

--------------------------------------------------
【以下是我的舊程式碼原始碼目錄位置】
C:\工作台\ReverseEngineering4Test\                  

【重要規則】
 - 檔案如有讀取不到或異常就必須停下來不要再繼續