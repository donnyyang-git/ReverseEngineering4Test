因為我想用這篇文章來試做反向工程, 幫我產生一個java專案(eclipse), 目錄架構, jsp, javascript , servlet,bean 範例, 程式內容要有多方面的判斷, 檢核, 等等, 以便確認反向工程產出實際有效。


為了讓你能完整測試「靜態程式碼分析 (AST/Prompt)」或「動態探索 (Browser/Playwright)」的反向工程效果，這裡為你設計一個典型的 Java Web (Eclipse Legacy Style) 範例專案。

這個範例模擬了企業舊系統常見的**多重條件判斷、動態 DOM 顯示、Session 狀態控管與複合業務檢核**。

---

### 一、 Eclipse 專案目錄結構 (Dynamic Web Project)

你可以直接在 Eclipse 中建立一個 **Dynamic Web Project**（專案名稱設為 `LegacyOrderSystem`），目錄架構如下：

```plaintext
LegacyOrderSystem/
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── legacy/
│                   ├── model/
│                   │   └── OrderBean.java
│                   └── servlet/
│                       └── OrderProcessServlet.java
└── WebContent/ (或 src/main/webapp/)
    ├── META-INF/
    ├── WEB-INF/
    │   └── web.xml
    ├── js/
    │   └── order.js
    └── order_form.jsp

```

---

### 二、 完整程式碼範例

#### 1. Data Model: `OrderBean.java`

放置於 `src/main/java/com/legacy/model/OrderBean.java`

```java
package com.legacy.model;

import java.io.Serializable;

public class OrderBean implements Serializable {
    private static final long serialVersionUID = 1L;

    private String customerId;
    private String customerType; // "VIP", "REGULAR", "NEW"
    private String productId;
    private int quantity;
    private double unitPrice;
    private double discountRate;
    private double totalPrice;
    private String status;

    public OrderBean() {}

    // Getter and Setter Methods
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getCustomerType() { return customerType; }
    public void setCustomerType(String customerType) { this.customerType = customerType; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }

    public double getDiscountRate() { return discountRate; }
    public void setDiscountRate(double discountRate) { this.discountRate = discountRate; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

```

---

#### 2. Frontend View: `order_form.jsp`

放置於 `WebContent/order_form.jsp`
*(包含前端條件顯示、舊式 Alert 與後端 Message 回傳與 Scriptlet)*

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.legacy.model.OrderBean" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>舊版訂單處理系統</title>
<script src="js/order.js"></script>
</head>
<body>
    <h2>訂單採購系統 (Legacy)</h2>

    <%-- 顯示 Servlet 處理結果 --%>
    <%
        String errorMsg = (String) request.getAttribute("errorMsg");
        String successMsg = (String) request.getAttribute("successMsg");
        OrderBean lastOrder = (OrderBean) session.getAttribute("currentOrder");
        
        if (errorMsg != null) {
    %>
        <div id="error-banner" style="color: red; border: 1px solid red; padding: 10px; margin-bottom: 10px;">
            <strong>錯誤：</strong> <%= errorMsg %>
        </div>
    <%
        }
        if (successMsg != null) {
    %>
        <div id="success-banner" style="color: green; border: 1px solid green; padding: 10px; margin-bottom: 10px;">
            <strong>成功：</strong> <%= successMsg %>
        </div>
    <%
        }
    %>

    <form id="orderForm" action="OrderProcessServlet" method="post" onsubmit="return validateOrderForm();">
        <table border="1" cellpadding="5">
            <tr>
                <td>客戶 ID:</td>
                <td>
                    <input type="text" id="customerId" name="customerId" placeholder="請輸入 CUST- 開頭帳號" />
                    <span style="color:gray;">(必須以 CUST- 開頭)</span>
                </td>
            </tr>
            <tr>
                <td>客戶類別:</td>
                <td>
                    <select id="customerType" name="customerType" onchange="toggleVipCode();">
                        <option value="">--請選擇--</option>
                        <option value="REGULAR">一般客戶</option>
                        <option value="VIP">VIP 會員</option>
                        <option value="NEW">新顧客</option>
                    </select>
                </td>
            </tr>
            <tr id="vipCodeRow" style="display:none;">
                <td>VIP 通關密碼:</td>
                <td>
                    <input type="password" id="vipCode" name="vipCode" placeholder="VIP168" />
                </td>
            </tr>
            <tr>
                <td>產品項目:</td>
                <td>
                    <select id="productId" name="productId">
                        <option value="">--請選擇產品--</option>
                        <option value="PROD-A">高階伺服器 ($1,000)</option>
                        <option value="PROD-B">標準工作站 ($500)</option>
                        <option value="PROD-C">企業授權軟體 ($200)</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>訂購數量:</td>
                <td>
                    <input type="number" id="quantity" name="quantity" min="1" max="100" value="1" />
                </td>
            </tr>
            <tr>
                <td>付款方式:</td>
                <td>
                    <input type="radio" name="paymentMethod" value="CREDIT" checked /> 信用卡
                    <input type="radio" name="paymentMethod" value="TRANSFER" /> 銀行轉帳
                </td>
            </tr>
            <tr>
                <td colspan="2" align="center">
                    <button type="submit" id="btnSubmit">送出訂單</button>
                    <button type="reset" onclick="resetVipRow();">重設</button>
                </td>
            </tr>
        </table>
    </form>

    <%-- 顯示歷史最後一張成功訂單概要 --%>
    <% if (lastOrder != null) { %>
        <hr/>
        <h3>最後一次成功的 Session 訂單紀錄</h3>
        <ul>
            <li>客戶: <%= lastOrder.getCustomerId() %> (<%= lastOrder.getCustomerType() %>)</li>
            <li>產品: <%= lastOrder.getProductId() %> x <%= lastOrder.getQuantity() %></li>
            <li>實付總額: $<%= lastOrder.getTotalPrice() %> (折扣率: <%= (int)(lastOrder.getDiscountRate() * 100) %>%)</li>
            <li>狀態: <%= lastOrder.getStatus() %></li>
        </ul>
    <% } %>
</body>
</html>

```

---

#### 3. Client Logic: `order.js`

放置於 `WebContent/js/order.js`
*(包含前端表單檢核與動態 DOM 展延邏輯)*

```javascript
function toggleVipCode() {
    var type = document.getElementById("customerType").value;
    var vipRow = document.getElementById("vipCodeRow");
    if (type === "VIP") {
        vipRow.style.display = "";
    } else {
        vipRow.style.display = "none";
        document.getElementById("vipCode").value = "";
    }
}

function resetVipRow() {
    document.getElementById("vipCodeRow").style.display = "none";
}

function validateOrderForm() {
    var custId = document.getElementById("customerId").value.trim();
    var custType = document.getElementById("customerType").value;
    var vipCode = document.getElementById("vipCode").value.trim();
    var productId = document.getElementById("productId").value;
    var quantity = parseInt(document.getElementById("quantity").value, 10);

    // 檢核 1: 必填欄位
    if (custId === "") {
        alert("錯誤：請填寫客戶 ID");
        return false;
    }
    if (!custId.startsWith("CUST-")) {
        alert("錯誤：客戶 ID 格式不符合，必須以 CUST- 開頭");
        return false;
    }

    // 檢核 2: 客戶類型選擇
    if (custType === "") {
        alert("錯誤：請選擇客戶類別");
        return false;
    }

    // 檢核 3: VIP 通關密碼動態檢核
    if (custType === "VIP" && vipCode === "") {
        alert("錯誤：VIP 客戶必須填寫 VIP 通關密碼");
        return false;
    }

    // 檢核 4: 產品選擇與數量
    if (productId === "") {
        alert("錯誤：請選擇產品");
        return false;
    }
    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
        alert("錯誤：購買數量必須介於 1 到 100 之間");
        return false;
    }

    return true;
}

```

---

#### 4. Controller & Core Business Rules: `OrderProcessServlet.java`

放置於 `src/main/java/com/legacy/servlet/OrderProcessServlet.java`
*(包含複合業務邏輯、折扣矩陣計算、限制檢核與多分支轉向)*

```java
package com.legacy.servlet;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.legacy.model.OrderBean;

@WebServlet("/OrderProcessServlet")
public class OrderProcessServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        
        String customerId = request.getParameter("customerId");
        String customerType = request.getParameter("customerType");
        String vipCode = request.getParameter("vipCode");
        String productId = request.getParameter("productId");
        String quantityStr = request.getParameter("quantity");
        String paymentMethod = request.getParameter("paymentMethod");

        // [後端二次防護檢核 1]: 基礎 null/空值檢查
        if (customerId == null || !customerId.startsWith("CUST-") || productId == null || productId.isEmpty()) {
            request.setAttribute("errorMsg", "請求無效：無效的客戶 ID 或未選擇產品。");
            request.getRequestDispatcher("order_form.jsp").forward(request, response);
            return;
        }

        // [後端二次防護檢核 2]: VIP 密碼驗證
        if ("VIP".equals(customerType) && !"VIP168".equals(vipCode)) {
            request.setAttribute("errorMsg", "VIP 驗證失敗：VIP 通關密碼不正確！");
            request.getRequestDispatcher("order_form.jsp").forward(request, response);
            return;
        }

        int quantity = 0;
        try {
            quantity = Integer.parseInt(quantityStr);
        } catch (NumberFormatException e) {
            quantity = 0;
        }

        if (quantity <= 0 || quantity > 100) {
            request.setAttribute("errorMsg", "數量異常：訂購數量超出許可範圍 (1-100)。");
            request.getRequestDispatcher("order_form.jsp").forward(request, response);
            return;
        }

        // [商業邏輯 1]: 單價判定
        double unitPrice = 0.0;
        if ("PROD-A".equals(productId)) {
            unitPrice = 1000.0;
        } else if ("PROD-B".equals(productId)) {
            unitPrice = 500.0;
        } else if ("PROD-C".equals(productId)) {
            unitPrice = 200.0;
        } else {
            request.setAttribute("errorMsg", "產品錯誤：找不到對應的產品價格。");
            request.getRequestDispatcher("order_form.jsp").forward(request, response);
            return;
        }

        // [商業邏輯 2]: 階梯折扣矩陣計算
        double discountRate = 0.0; // 0.0 代表無折扣，0.15 代表 85 折

        if ("VIP".equals(customerType)) {
            discountRate = 0.20; // VIP 基礎 8 折
            if (quantity >= 10) {
                discountRate = 0.30; // VIP 大量採購 7 折
            }
        } else if ("REGULAR".equals(customerType)) {
            if (quantity >= 20) {
                discountRate = 0.15; // 一般客戶大宗採購 85 折
            } else if (quantity >= 5) {
                discountRate = 0.05; // 一般客戶小額折扣 95 折
            }
        } else if ("NEW".equals(customerType)) {
            discountRate = 0.10; // 新首購固定 9 折
            // 風險控管：新客戶不允許單筆超過 $5,000 的信用卡交易
            double rawTotal = unitPrice * quantity;
            if ("CREDIT".equals(paymentMethod) && rawTotal > 5000) {
                request.setAttribute("errorMsg", "風控限制：新客戶首購使用信用卡單筆不得超過 $5,000，請改用轉帳或調整數量。");
                request.getRequestDispatcher("order_form.jsp").forward(request, response);
                return;
            }
        }

        // 總額計算
        double subtotal = unitPrice * quantity;
        double totalPrice = subtotal * (1.0 - discountRate);

        // 建立並填入 Bean
        OrderBean order = new OrderBean();
        order.setCustomerId(customerId);
        order.setCustomerType(customerType);
        order.setProductId(productId);
        order.setQuantity(quantity);
        order.setUnitPrice(unitPrice);
        order.setDiscountRate(discountRate);
        order.setTotalPrice(totalPrice);
        order.setStatus("APPROVED");

        // 存入 Session 供前頁展示
        HttpSession session = request.getSession();
        session.setAttribute("currentOrder", order);

        // 回傳成功訊息
        request.setAttribute("successMsg", String.format("訂單成立！總金額為 $%.2f (省下 $%.2f)", totalPrice, (subtotal - totalPrice)));
        request.getRequestDispatcher("order_form.jsp").forward(request, response);
    }
}

```

---

#### 5. Deployment Descriptor: `web.xml`

放置於 `WebContent/WEB-INF/web.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xmlns="http://xmlns.jcp.org/xml/ns/javaee" 
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd" 
         id="WebApp_ID" version="3.1">
         
  <display-name>LegacyOrderSystem</display-name>
  
  <welcome-file-list>
    <welcome-file>order_form.jsp</welcome-file>
  </welcome-file-list>
</web-app>

```

---

### 三、 反向工程測試驗證重點（測試矩陣）

當你把上述原始碼丟給 **AI/Agent 工具**（或使用 Playwright / Midscene 跑動態探索）時，一個成功的反向工程應該要能從程式碼中自動提取出以下 **10 個測試案例 (Test Matrix)**：

| 案例 ID | 情境說明 | 觸發條件/輸入 | 預期結果 (Assertions) |
| --- | --- | --- | --- |
| **TC-01** | 前端：ID 格式無效 | `customerId` 不包含 `CUST-` | 彈出 Alert「錯誤：客戶 ID 格式不符合」 |
| **TC-02** | 前端：動態欄位展延 | `customerType` 選取 `VIP` | DOM `#vipCodeRow` 從 `display:none` 變為可見 |
| **TC-03** | 前端：VIP 未填密碼 | `customerType`="VIP", `vipCode`="" | 彈出 Alert「錯誤：VIP 客戶必須填寫...」 |
| **TC-04** | 後端：VIP 密碼不正確 | `vipCode`="WRONG_CODE" | 回傳 `order_form.jsp` 並在 `#error-banner` 顯示「VIP 驗證失敗」 |
| **TC-05** | 後端：新客戶風控攔截 | `customerType`="NEW", `productId`="PROD-A", `quantity`=6, `paymentMethod`="CREDIT" (金額 $6000 > $5000) | 回傳 `#error-banner` 顯示「風控限制：新客戶首購使用信用卡...」 |
| **TC-06** | 後端：VIP 少量採購折扣 | `customerType`="VIP", `quantity`=2 ($1000 * 2 * 0.8) | 成功成立訂單，折扣率 20%，總價 $1600.00 |
| **TC-07** | 後端：VIP 大量採購折扣 | `customerType`="VIP", `quantity`=10 ($1000 * 10 * 0.7) | 成功成立訂單，折扣率 30%，總價 $7000.00 |
| **TC-08** | 後端：一般客戶階梯折扣 1 | `customerType`="REGULAR", `quantity`=5 ($1000 * 5 * 0.95) | 成功成立訂單，折扣率 5%，總價 $4750.00 |
| **TC-09** | 後端：一般客戶階梯折扣 2 | `customerType`="REGULAR", `quantity`=20 ($1000 * 20 * 0.85) | 成功成立訂單，折扣率 15%，總價 $17000.00 |
| **TC-10** | Session 狀態持久化 | 訂單送出成功後重新載入頁面 | 頁面下方的 `<ul>` 區域呈現 Session 內的最後一次訂單細節 |

你可以把這個專案編譯並執行在 Tomcat 8.5 / 9 上，直接用此套程式碼測試 AI 生成 JUnit 5 + Mockito 測試案例，或是生成 Playwright / Midscene.js 的 E2E 測試腳本！