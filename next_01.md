完成這份「微觀級別測試反向工程分析」報告後，在標準的軟體測試與品質工程（QA/DevSecOps）流程中，後續應該產出的**具體交付物與執行項目**包含以下 4 個核心部分：

---

### 一、 實作自動化測試腳本 (Automated Test Scripts)

依據報告「第五區塊：結構化測試用例」，將抽象的用例規格轉化為可執行的測試程式碼：

1. **後端單元與整合測試 (JUnit 5 + Mockito)**
* **目標**：驗證直接呼叫 `UserServlet` 時的邊界條件與繞過風險（驗證用例集 C）。
* **產出物**：`UserServletTest.java`


```java
@Test
@DisplayName("TC_USR_003_BE_BYPASS_NULL: 繞過前端傳送空字串，驗證後端行為")
void testPost_WhenUsernameIsEmpty_ShouldFailOrSanitize() throws Exception {
    when(request.getParameter("username")).thenReturn("");
    when(request.getParameter("email")).thenReturn("test@valid-domain.co");
    when(request.getRequestDispatcher("user.jsp")).thenReturn(dispatcher);

    userServlet.doPost(request, response);

    // 驗證後端是否有保護機制，或斷言 Bean 中的資料狀態
    verify(request).setAttribute(eq("user"), argThat(user -> 
        ((UserBean) user).getUsername().equals("Guest") // 預期修補後的防禦行為
    ));
}

```


2. **前端 E2E / UI 自動化測試 (Playwright / Vitest)**
* **目標**：驗證 `index.jsp` 與 `clientValidation.js` 的互動邏輯、彈出視窗與攔截行為（驗證用例集 A 與 B）。
* **產出物**：`userForm.spec.ts`


```typescript
test('TC_USR_002_JS_FAIL_EMAIL: 輸入不合法 Email 時應被前端攔截並彈出 Alert', async ({ page }) => {
  await page.goto('/index.jsp');
  await page.fill('#username', 'ValidName');
  await page.fill('#email', 'invalid-email-format');

  // 監聽 dialog (alert)
  page.on('dialog', async dialog => {
    expect(dialog.message()).toContain('電子信箱的格式有誤');
    await dialog.dismiss();
  });

  await page.click('#submitBtn');
  // 確認頁面未跳轉 (未成功 POST)
  expect(page.url()).toContain('/index.jsp');
});

```



---

### 二、 程式碼安全修補與重構建議 (Security Patch & Refactoring)

分析報告中「三、多層次驗證與防禦缺口」列出了**高風險漏洞**（後端無驗證、XSS 隱患），接著應產出**防禦性程式碼修正方案**交由開發團隊修補：

1. **後端輸入驗證層 (Backend Validation Filter / Utility)**
* **產出物**：補強 `UserServlet.java` 或加入 Jakarta Bean Validation，確保即便繞過 JS，後端依然擋下無效值。


```java
// 建議修補範例：Servlet 後端強制過濾與清洗
String username = request.getParameter("username");
String email = request.getParameter("email");

if (username == null || username.trim().length() < 2) {
    username = "Guest"; // 或返回 HTTP 400 Bad Request
}
if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
    email = "no-email@example.com";
}

```


2. **XSS 防禦與 JSP 輸出轉義 (HTML Sanitization)**
* **產出物**：重構 `user.jsp`，確保使用 `c:out` 或 JSTL 轉義，防止腳本注入攻擊。


```jsp
<%-- 修改前 (極高風險) --%>
<p>Welcome, ${user.username}</p>

<%-- 修改後 (修補完成) --%>
<p>Welcome, <c:out value="${user.username}" escapeXml="true"/></p>

```



---

### 三、 參數化測試資料集 (Parametrized Test Dataset)

報告中「四、等價類與極限邊界值 (BVA)」需要實體化為可用於自動化測試的測試資料庫：

* **產出物**：`user_test_data.json` 或 JUnit 5 `@ParameterizedTest` 資料源

```json
[
  { "id": "BVA_01", "username": "A", "email": "valid@test.com", "expectedJS": "FAIL", "expectedBE": "REJECT" },
  { "id": "BVA_02", "username": "AB", "email": "valid@test.com", "expectedJS": "PASS", "expectedBE": "ACCEPT" },
  { "id": "BVA_03", "username": "<script>alert(1)</script>", "email": "valid@test.com", "expectedJS": "PASS", "expectedBE": "SANITIZE" },
  { "id": "BVA_04", "username": "ValidUser", "email": "user@domain..com", "expectedJS": "FAIL", "expectedBE": "REJECT" }
]

```

---

### 四、 需求與測試追蹤矩陣 (Requirement Traceability Matrix, RTM)

將程式碼檔案、風險點與測試案例建立連結，用於專案稽核（如 ISO 27001 驗證或合規審查）：

| 模組/程式碼 | 業務規則 / 風險點 | 對應測試案例 ID | 測試類型 | 執行狀態 |
| --- | --- | --- | --- | --- |
| `clientValidation.js` | 姓名需 $\ge 2$ 字元 | `TC_USR_001`, `TC_USR_002` | E2E (Playwright) | 待執行 |
| `UserServlet.java` | 繞過前端驗證與 Null 值處理 | `TC_USR_003` | Unit (JUnit 5) | 待執行 |
| `user.jsp` | XSS 跨站腳本攻擊預防 | `TC_SEC_001` | Security (DAST/SAST) | 待執行 |

---

要為這份分析報告生成 **JUnit 5 測試腳本**，或是撰寫 **Servlet 的修補與過濾程式碼**？