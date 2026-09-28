C:\工作台\ReverseEngineering4Test

# 提示詞

目前的目錄是C:\工作台\ReverseEngineering4Test，你需要讀取目錄下原始碼檔案內容(目錄下檔案見reverse_do.md)，
產出以下維度的內容至新的規劃MD檔案(ReverseEngineering4Test_01.md)

你是一位資深 QA 自動化架構師與軟體反向工程專家。請針對我提供的程式碼進行「微觀級別（Micro-level）」的業務邏輯拆解與測試規劃，將抽象程式碼還原為極致精細的測試規格。

請依序按照以下 5 個微觀維度進行分析，嚴禁高階概括，必須拆解至變數與判斷條件級別：

---

### 一、 輸入參數與狀態邊界解析 (Input & State Matrix)
1. **輸入參數窮舉表**：列出所有輸入來源（包含 Query String、Form Payload、Session/Header 隱含參數、DB 預存變數），並以表格整理：
   | 參數名稱 | 資料型態 | 可否為 Null / Empty | 正則/長度限制 | 預設值 | 隱含商業含意 |
2. **狀態轉移矩陣 (State Machine)**：若程式碼涉及狀態改變（如：訂單狀態、權限層級、Flag 變更），請列出所有「變更前狀態 -> 觸發條件 -> 變更後狀態」及非法轉移（例如：已取消訂單不可轉為已付款）。

---

### 二、 邏輯分支與條件組合解構 (Decision & Branch Coverage)
1. **巢狀條件分解 (If/Else Nesting)**：列出程式碼中每一個 `if/else`、`switch` 與三元運算子，指出隱含的短路邏輯（Short-circuit evaluation，如 `A && B` 當 A 為假時不執行 B）。
2. **邏輯真值表 (Truth Table)**：針對複雜的多條件判斷（包含超過 2 個組合條件的敘述），畫出 True/False 組合表，並指出每個組合對應的程式碼執行路徑。

---

### 三、 多層次驗證與防禦缺口對照 (Multi-tier Validation Mapping)
請建立「前端/後端/資料庫」三層驗證對照表，並精確找出防禦缺口：
| 業務規則/欄位 | 前端 (JS/UI) 是否驗證 | 後端 (Servlet/API) 是否驗證 | 資料庫 (Constraint/Trigger) 是否約束 | 繞過風險點 (如：缺乏後端驗證、SQLi、越權漏洞) |
|---|---|---|---|---|

---

### 四、 異常鏈、交易與邊界分析 (Exception & Boundary Analysis)
1. **等價類與極限邊界值測試 (BVA)**：針對每個數值與字串欄位，列出：
   - 有效等價類 (Valid Equivalence Class)
   - 無效等價類 (Invalid Equivalence Class：型態錯誤、超長、特殊字元如 SQL/HTML 注入字串)
   - 極限邊界值：Min-1, Min, Min+1, Max-1, Max, Max+1, 溢位（Overflow）值
2. **異常處理與交易 Rollback (Transaction Check)**：
   - 列出所有受控（Checked）與非受控（Unchecked）Exception 的觸發點。
   - 分析異動 DB 的點：若發生 Exception，事務（Transaction）是否會完整 Rollback？是否有「半寫入（Partial Write）」或孤兒資料風險？

---

### 五、 結構化測試用例生成 (Test Case Specification)
將上述分析結果，轉化為可直接撰寫自動化測試（JUnit 5 / Playwright / Vitest）的結構化案例規格：
1. **測試案例 ID 與名稱**
2. **前置條件 (Pre-conditions)**（包含 Mock 資料庫狀態、Session 注入資料）
3. **精確輸入 (Exact Test Input)**（JSON / Form Key-Value）
4. **預期結果 (Expected Output)**：
   - HTTP Status Code & Response Body
   - DB 最終狀態變更（精確欄位與數值）
   - Log 紀錄或 Exception 訊息


--------------------------------------------------
【以下是我的舊程式碼原始碼目錄位置】
C:\工作台\ReverseEngineering4Test\

【重要規則】
 - 檔案如有讀取不到或異常，一定要重新多次嘗試，最後還是異常的話，就必須停下來不要再繼續。

 