<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Tomcat Servlet & Bean 範例</title>
    <style>
        body { font-family: sans-serif; margin: 40px; background-color: #f9f9f9; color: #333; }
        .container { max-width: 500px; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #0066cc; font-size: 24px; }
        label { display: block; margin-top: 10px; font-weight: bold; }
        input[type="text"], input[type="email"] { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
        button { margin-top: 15px; background: #0066cc; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #004999; }
        .result { margin-top: 20px; padding: 15px; background: #eef6fc; border-left: 4px solid #0066cc; }
    </style>
</head>
<body>
<div class="container">
    <h1>Tomcat Servlet + Bean 示範</h1>
    
    <%-- 顯示從 Servlet 傳過來的 UserBean 資料 --%>
    <% 
        com.example.model.UserBean user = (com.example.model.UserBean) request.getAttribute("user");
        if (user != null) {
    %>
        <div class="result">
            <h3>目前使用者資訊 (Java Bean):</h3>
            <p><strong>姓名 (Username):</strong> <%= user.getUsername() %></p>
            <p><strong>信箱 (Email):</strong> <%= user.getEmail() %></p>
        </div>
    <% } %>

    <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;">

    <h3>更新使用者資料</h3>
    <form action="user" method="POST">
        <label for="username">姓名:</label>
        <input type="text" id="username" name="username" value="<%= user != null ? user.getUsername() : "" %>" required>

        <label for="email">電子信箱:</label>
        <input type="email" id="email" name="email" value="<%= user != null ? user.getEmail() : "" %>" required>

        <button type="submit">送出更新</button>
    </form>
</div>
</body>
</html>
