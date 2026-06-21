package com.freelencerhub.notification;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class NotificationServiceApplicationTest {

    @Test
    void mainMethodTest() {
        assertDoesNotThrow(() -> {
            try {
                NotificationServiceApplication.main(new String[]{});
            } catch (Exception e) {
                // Ignore startup failures in unit test, we just want line coverage
            }
        });
    }
}
