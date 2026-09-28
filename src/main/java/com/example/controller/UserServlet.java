package com.example.controller;

import com.example.model.UserBean;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/user")
public class UserServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // Create a sample bean
        UserBean user = new UserBean("John Doe", "john.doe@example.com");
        
        // Pass bean to request attribute
        request.setAttribute("user", user);
        
        // Forward to JSP view
        request.getRequestDispatcher("/WEB-INF/views/user.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        
        // Read form parameters
        String username = request.getParameter("username");
        String email = request.getParameter("email");
        
        // Populate Bean
        UserBean user = new UserBean();
        user.setUsername(username != null ? username : "Guest");
        user.setEmail(email != null ? email : "no-email@example.com");
        
        // Set attribute and forward
        request.setAttribute("user", user);
        request.getRequestDispatcher("/WEB-INF/views/user.jsp").forward(request, response);
    }
}
