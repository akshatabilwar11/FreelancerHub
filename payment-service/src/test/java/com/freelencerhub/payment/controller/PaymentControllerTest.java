package com.freelencerhub.payment.controller;

import com.freelencerhub.payment.dto.PaymentDTO;
import com.freelencerhub.payment.entity.Payment;
import com.freelencerhub.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    @Test
    void testGetAllPayments() {
        Payment p = new Payment(1L, 1L, 2L, 100.0, "COMPLETED", null);
        when(paymentService.getAllPayments()).thenReturn(Arrays.asList(p));
        List<PaymentDTO> list = paymentController.getAllPayments();
        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getId());
    }

    @Test
    void testProcessPayment() {
        Payment p = new Payment(null, 1L, 2L, 100.0, "PENDING", null);
        Payment saved = new Payment(1L, 1L, 2L, 100.0, "COMPLETED", "TXN-123");
        when(paymentService.processPayment(any(Payment.class))).thenReturn(saved);
        PaymentDTO result = paymentController.processPayment(p);
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(1L, result.getId());
    }

    @Test
    void testGetPaymentsByProject() {
        Payment p = new Payment(1L, 1L, 2L, 100.0, "COMPLETED", null);
        when(paymentService.getPaymentsByProject(1L)).thenReturn(Arrays.asList(p));
        List<PaymentDTO> list = paymentController.getPaymentsByProject(1L);
        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getProjectId());
    }
}
