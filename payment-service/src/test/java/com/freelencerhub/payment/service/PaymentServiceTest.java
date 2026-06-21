package com.freelencerhub.payment.service;

import com.freelencerhub.payment.entity.Payment;
import com.freelencerhub.payment.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void testGetAllPayments() {
        Payment p = new Payment(1L, 1L, 2L, 100.0, "COMPLETED", null);
        when(paymentRepository.findAll()).thenReturn(Arrays.asList(p));
        List<Payment> result = paymentService.getAllPayments();
        assertEquals(1, result.size());
        verify(paymentRepository, times(1)).findAll();
    }

    @Test
    void testProcessPayment_Success() {
        Payment p = new Payment(null, 1L, 2L, 100.0, "PENDING", null);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        Payment result = paymentService.processPayment(p);

        assertEquals("ESCROWED", result.getStatus());
        assertEquals(1L, result.getId());
        assertNotNull(result.getTransactionId());
        assertTrue(result.getTransactionId().startsWith("TXN-ESC-"));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void testProcessPayment_NegativeAmount() {
        Payment p = new Payment(null, 1L, 2L, -50.0, "PENDING", null);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment result = paymentService.processPayment(p);

        assertEquals("FAILED", result.getStatus());
        verify(paymentRepository, times(1)).save(p);
    }

    @Test
    void testReleasePayment_Success() {
        Payment p = new Payment(1L, 1L, 2L, 100.0, "ESCROWED", "TXN-ESC-123");
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(p));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment result = paymentService.releasePayment(1L);

        assertEquals("COMPLETED", result.getStatus());
        assertTrue(result.getTransactionId().startsWith("TXN-REL-"));
        verify(paymentRepository, times(1)).save(p);
    }

    @Test
    void testReleasePayment_NotFound() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> paymentService.releasePayment(1L));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void testReleasePayment_NotEscrowed() {
        Payment p = new Payment(1L, 1L, 2L, 100.0, "COMPLETED", "TXN-REL-123");
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(p));

        Payment result = paymentService.releasePayment(1L);

        assertEquals("COMPLETED", result.getStatus());
        assertEquals("TXN-REL-123", result.getTransactionId()); // remains unchanged
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void testGetPaymentsByProject() {
        Payment p = new Payment(1L, 1L, 2L, 100.0, "COMPLETED", null);
        when(paymentRepository.findByProjectId(1L)).thenReturn(Arrays.asList(p));
        List<Payment> result = paymentService.getPaymentsByProject(1L);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getProjectId());
    }

    @Test
    void testGetTotalEarnings_Success() {
        when(paymentRepository.getTotalEarningsByFreelancer(2L)).thenReturn(350.0);
        Double result = paymentService.getTotalEarnings(2L);
        assertEquals(350.0, result);
    }

    @Test
    void testGetTotalEarnings_Null() {
        when(paymentRepository.getTotalEarningsByFreelancer(2L)).thenReturn(null);
        Double result = paymentService.getTotalEarnings(2L);
        assertEquals(0.0, result);
    }

    @Test
    void testGetTotalSpent_NullOrEmptyList() {
        assertEquals(0.0, paymentService.getTotalSpent(null));
        assertEquals(0.0, paymentService.getTotalSpent(Collections.emptyList()));
    }

    @Test
    void testGetTotalSpent_Success() {
        List<Long> projectIds = Arrays.asList(1L, 2L);
        when(paymentRepository.getTotalSpentByProjects(projectIds)).thenReturn(750.0);
        Double result = paymentService.getTotalSpent(projectIds);
        assertEquals(750.0, result);
    }

    @Test
    void testGetTotalSpent_Null() {
        List<Long> projectIds = Arrays.asList(1L, 2L);
        when(paymentRepository.getTotalSpentByProjects(projectIds)).thenReturn(null);
        Double result = paymentService.getTotalSpent(projectIds);
        assertEquals(0.0, result);
    }
}
