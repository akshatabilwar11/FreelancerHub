package com.freelencerhub.payment.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PaymentEntityTest {

    @Test
    void testPaymentPOJO() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setProjectId(101L);
        payment.setFreelancerId(202L);
        payment.setAmount(5000.0);
        payment.setStatus("COMPLETED");

        assertEquals(1L, payment.getId());
        assertEquals(101L, payment.getProjectId());
        assertEquals(202L, payment.getFreelancerId());
        assertEquals(5000.0, payment.getAmount());
        assertEquals("COMPLETED", payment.getStatus());

        Payment payment2 = new Payment(1L, 101L, 202L, 5000.0, "COMPLETED", null);
        assertEquals(payment, payment2);
        assertEquals(payment.hashCode(), payment2.hashCode());
        assertNotNull(payment.toString());
    }
}
