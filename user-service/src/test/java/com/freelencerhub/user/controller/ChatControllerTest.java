package com.freelencerhub.user.controller;

import org.junit.jupiter.api.Test;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChatControllerTest {

    private final ChatController chatController = new ChatController();

    @Test
    void testHandleQuery_Register() {
        Map<String, String> request = new HashMap<>();
        request.put("query", "How to register on the site?");
        Map<String, String> response = chatController.handleQuery(request);
        assertTrue(response.get("reply").contains("Register"));
    }

    @Test
    void testHandleQuery_Payment() {
        Map<String, String> request = new HashMap<>();
        request.put("query", "How can I pay?");
        Map<String, String> response = chatController.handleQuery(request);
        assertTrue(response.get("reply").contains("payments"));
    }

    @Test
    void testHandleQuery_ResetPassword() {
        Map<String, String> request = new HashMap<>();
        request.put("query", "I forgot password");
        Map<String, String> response = chatController.handleQuery(request);
        assertTrue(response.get("reply").contains("Forgot Password"));
    }

    @Test
    void testHandleQuery_Hi() {
        Map<String, String> request = new HashMap<>();
        request.put("query", "hello assistant");
        Map<String, String> response = chatController.handleQuery(request);
        assertTrue(response.get("reply").contains("AI Assistant"));
    }

    @Test
    void testHandleQuery_Default() {
        Map<String, String> request = new HashMap<>();
        request.put("query", "some random query");
        Map<String, String> response = chatController.handleQuery(request);
        assertTrue(response.get("reply").contains("support@freelencerhub.com"));
    }
}
