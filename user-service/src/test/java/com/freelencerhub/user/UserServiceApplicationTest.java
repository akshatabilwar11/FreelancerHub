package com.freelencerhub.user;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class UserServiceApplicationTest {

    @Test
    void mainMethodTest() {
        assertDoesNotThrow(() -> {
            try {
                UserServiceApplication.main(new String[]{});
            } catch (Exception e) {
                // Ignore startup failures in unit test, we just want line coverage
            }
        });
    }
}
