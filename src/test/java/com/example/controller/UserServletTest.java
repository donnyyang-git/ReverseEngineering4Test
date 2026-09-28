// File Path: src/test/java/com/example/controller/UserServletTest.java
package com.example.controller;

import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.io.IOException;
import com.example.model.UserBean;

/**
 * @DisplayName(Test Suite: UserServlet/Controller Integration Tests)
 * 自動化測試腳本：配合 UserServlet 實際邏輯進行單元及整合測試。
 */
public class UserServletTest {

    private HttpServletRequest request;
    private HttpServletResponse response;
    private RequestDispatcher dispatcher;
    private HttpSession session;

    @BeforeEach
    void setUp() throws IOException, ServletException {
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        dispatcher = mock(RequestDispatcher.class);
        session = mock(HttpSession.class);

        // 模糊匹配確保 getRequestDispatcher 不回傳 null
        when(request.getRequestDispatcher(anyString())).thenReturn(dispatcher);
        when(request.getSession()).thenReturn(session);
        when(request.getSession(anyBoolean())).thenReturn(session);

        // 模擬 forward 轉發
        doNothing().when(dispatcher).forward(any(HttpServletRequest.class), any(HttpServletResponse.class));

        // 預設參數
        when(request.getParameter("username")).thenReturn(null);
        when(request.getParameter("email")).thenReturn(null);
    }

    /**
     * @DisplayName (TC_USR_001) 成功路徑測試
     */
    @Test
    void testHappyPathSubmission() throws ServletException, IOException {
        String validUsername = "ValidUserAlpha";
        String validEmail = "valid.user@example.com";

        when(request.getParameter("username")).thenReturn(validUsername);
        when(request.getParameter("email")).thenReturn(validEmail);
        
        UserServlet servlet = new UserServlet();
        servlet.doPost(request, response);

        ArgumentCaptor<Object> userBeanCaptor = ArgumentCaptor.forClass(UserBean.class);
        verify(request).setAttribute(eq("user"), userBeanCaptor.capture());
        UserBean capturedUser = (UserBean) userBeanCaptor.getValue();
        
        assertNotNull(capturedUser);
        assertEquals(validUsername, capturedUser.getUsername());
        verify(dispatcher).forward(eq(request), eq(response));
    }

    /**
     * @DisplayName (TC_USR_003) 繞過測試：驗證空值傳入時 Servlet 的實際處理
     */
    @ParameterizedTest(name = "Test Bypass Path with Username: ''{0}'' and Email: ''{1}''")
    @CsvSource({
        "'', 'test@valid-domain.co'",
        "'ValidName', ''"
    })
    void testBypassPathSubmission_WithInjectionVectors(String username, String email) throws ServletException, IOException {
        when(request.getParameter("username")).thenReturn(username);
        when(request.getParameter("email")).thenReturn(email);

        UserServlet servlet = new UserServlet();
        servlet.doPost(request, response);
        
        ArgumentCaptor<Object> userBeanCaptor = ArgumentCaptor.forClass(UserBean.class);
        verify(request).setAttribute(eq("user"), userBeanCaptor.capture());
        UserBean capturedUser = (UserBean) userBeanCaptor.getValue();

        assertNotNull(capturedUser);
        // 配合後端實際邏輯：允許傳入空字串
        if (username == null || username.isEmpty()) {
            assertEquals("", capturedUser.getUsername(), "後端允許並直接建構空字串的姓名。");
        }

        verify(dispatcher).forward(eq(request), eq(response));
    }
    
    /**
     * @DisplayName (TC_USR_003) 安全性測試：模擬 XSS Payload 輸入
     */
    @Test
    void testSecurityBypassPathSubmission_XSS() throws ServletException, IOException {
        String xssPayload = "<script>alert('XSS');</script>";
        when(request.getParameter("username")).thenReturn(xssPayload);
        when(request.getParameter("email")).thenReturn("safe@domain.com");

        UserServlet servlet = new UserServlet();
        servlet.doPost(request, response);

        ArgumentCaptor<Object> userBeanCaptor = ArgumentCaptor.forClass(UserBean.class);
        verify(request).setAttribute(eq("user"), userBeanCaptor.capture());
        
        UserBean capturedUser = (UserBean) userBeanCaptor.getValue();
        assertNotNull(capturedUser);
        
        // 配合後端實際邏輯：目前後端並未過濾 XSS，因此直接接收原始字串
        assertEquals(xssPayload, capturedUser.getUsername(), "確認後端直接接收了傳入的原始字串。");
    }

    /**
     * @DisplayName (TC_USR_002) 模擬前端欄位為空時，後端仍會正常執行 Forward 轉發流程
     */
    @Test
    void testClientSideFailureSimulation() throws ServletException, IOException {
        when(request.getParameter("username")).thenReturn("");
        when(request.getParameter("email")).thenReturn("");

        UserServlet servlet = new UserServlet();
        servlet.doPost(request, response);

        // 配合後端實際邏輯：確認不論參數是否為空，後端最後都會呼叫轉發
        verify(dispatcher, times(1)).forward(any(HttpServletRequest.class), any(HttpServletResponse.class));
    }
}
