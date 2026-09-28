# Tomcat Java Web 專案說明與 VS Code 使用指南

本專案是一個標準的 **Maven Java Web (Servlet + JSP + Bean)** 範例，已為 VS Code (Visual Studio Code) 進行專案結構配置。

## 目錄結構
```text
ReverseEngineering4Test/
├── .vscode/
│   ├── extensions.json  # 建議安裝的 VS Code Java 擴充套件清單
│   └── launch.json      # 除錯設定檔
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/
│       │       ├── controller/
│       │       │   └── UserServlet.java  # Servlet 控制器
│       │       └── model/
│       │           └── UserBean.java     # JavaBean 資料物件
│       └── webapp/
│           ├── WEB-INF/
│           │   ├── views/
│           │   │   └── user.jsp         # JSP 顯示頁面
│           │   └── web.xml              # 部署描述檔
│           └── index.jsp                # 首頁
├── pom.xml                                  # Maven 專案設定 (含 Servlet API 依賴)
└── README.md
```

---

## 如何在 VS Code 中開啟與執行

### 1. 安裝必要擴充套件
建議在 VS Code 中安裝以下擴充套件以獲得完整的 Java 開發體驗：
- **Extension Pack for Java** (`vscjava.vscode-java-pack`)
- **Tomcat for Java** (可選，用於直接在 IDE 內啟動 Tomcat 伺服器)

### 2. 開啟專案
在 VS Code 中選擇 **File > Open Folder...** 並打開：
`C:\Users\daphne\Downloads\工作台\ReverseEngineering4Test`

### 3. 編譯與打包
若系統中已安裝 Maven，可透過終端機執行打包指令生成 `.war` 檔案：
```bash
mvn clean package
```
打包完成後，war 檔會出現在 `target/TomcatServletDemo.war`。

### 4. 部署至 Tomcat 伺服器
1. 下載並安裝 **Apache Tomcat** (建議 9.x 或 10.x 版本)。
2. 將打包好的 `TomcatServletDemo.war` 複製到 Tomcat 的 `webapps/` 資料夾下。
3. 啟動 Tomcat (`bin/startup.bat` 或 `bin/catalina.sh run`)。
4. 在瀏覽器中輸入網址存取：
   - 首頁: `http://localhost:8080/TomcatServletDemo/`
   - Servlet: `http://localhost:8080/TomcatServletDemo/user`
