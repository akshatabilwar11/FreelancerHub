package com.freelencerhub.payment.controller;

import com.freelencerhub.payment.entity.Payment;
import com.freelencerhub.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
class PaymentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @Test
    void testGetAllPaymentsItems() throws Exception {
        Payment p = new Payment(1L, 1L, 2L, 100.0, "COMPLETED", null);
        when(paymentService.getAllPayments()).thenReturn(Arrays.asList(p));

        mockMvc.perform(get("/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void testProcessPaymentValid() throws Exception {
        Payment p = new Payment(1L, 1L, 2L, 100.0, "COMPLETED", null);
        when(paymentService.processPayment(any())).thenReturn(p);

        String json = "{\"projectId\": 1, \"freelancerId\": 2, \"amount\": 100.0, \"status\": \"PENDING\"}";

        mockMvc.perform(post("/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }
}
