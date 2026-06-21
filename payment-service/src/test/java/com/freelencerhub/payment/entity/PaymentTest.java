package com.freelencerhub.payment.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PaymentTest {

    @Test
    void testPaymentEntity() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setProjectId(10L);
        payment.setFreelancerId(20L);
        payment.setAmount(150.0);
        payment.setStatus("PENDING");

        assertEquals(1L, payment.getId());
        assertEquals(10L, payment.getProjectId());
        assertEquals(20L, payment.getFreelancerId());
        assertEquals(150.0, payment.getAmount());
        assertEquals("PENDING", payment.getStatus());

        Payment paymentAll = new Payment(2L, 11L, 21L, 200.0, "COMPLETED", null);
        assertEquals(2L, paymentAll.getId());
        
        assertNotNull(payment.toString());
        assertNotEquals(0, payment.hashCode());
        assertTrue(payment.equals(payment));
        assertFalse(payment.equals(null));
        assertFalse(payment.equals(new Object()));
    }
}
