package com.freelencerhub.user.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @PostMapping("/query")
    public Map<String, String> handleQuery(@RequestBody Map<String, String> request) {
        String query = request.get("query").toLowerCase();
        Map<String, String> response = new HashMap<>();

        if (query.contains("how to join") || query.contains("register")) {
            response.put("reply", "You can join FreelencerHub by clicking the 'Register' button on the top right. Choose your role as either a Client or a Freelancer!");
        } else if (query.contains("payment") || query.contains("pay")) {
            response.put("reply", "We support secure payments via credit cards and digital wallets. You can manage your transactions in the 'Payments' section of your dashboard.");
        } else if (query.contains("forgot password") || query.contains("reset")) {
            response.put("reply", "If you've forgotten your password, click on 'Forgot Password' on the login page. We will send an OTP to your registered email.");
        } else if (query.contains("hello") || query.contains("hi")) {
            response.put("reply", "Hello! I am your FreelencerHub AI Assistant. How can I help you today?");
        } else {
            response.put("reply", "That's a great question! For specific inquiries, please contact our support team at support@freelencerhub.com or check our FAQ page.");
        }

        return response;
    }
}
