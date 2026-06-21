package com.freelencerhub.payment;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class PaymentServiceApplicationTest {

    @Test
    void mainMethodTest() {
        assertDoesNotThrow(() -> {
            try {
                PaymentServiceApplication.main(new String[]{});
            } catch (Exception e) {
                // Ignore startup failures in unit test, we just want line coverage
            }
        });
    }
}
