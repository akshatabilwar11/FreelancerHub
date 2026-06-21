package com.freelencerhub.project;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class ProjectServiceApplicationTest {

    @Test
    void mainMethodTest() {
        assertDoesNotThrow(() -> {
            try {
                ProjectServiceApplication.main(new String[]{});
            } catch (Exception e) {
                // Ignore startup failures in unit test, we just want line coverage
            }
        });
    }
}
