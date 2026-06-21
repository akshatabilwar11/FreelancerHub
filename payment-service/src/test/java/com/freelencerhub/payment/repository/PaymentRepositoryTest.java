package com.freelencerhub.payment.repository;

import com.freelencerhub.payment.entity.Payment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PaymentRepositoryTest {

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    void testSaveAndFind() {
        Payment p = new Payment(null, 1L, 2L, 100.0, "PENDING", null);
        Payment saved = paymentRepository.save(p);
        
        assertNotNull(saved.getId());
        Optional<Payment> found = paymentRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("PENDING", found.get().getStatus());
    }
}
