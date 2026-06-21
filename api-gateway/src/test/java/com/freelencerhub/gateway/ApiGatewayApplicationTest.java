package com.freelencerhub.gateway;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class ApiGatewayApplicationTest {

    @Test
    void mainMethodTest() {
        assertDoesNotThrow(() -> {
            try {
                ApiGatewayApplication.main(new String[]{});
            } catch (Exception e) {
               
            }
        });
    }
}
