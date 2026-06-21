package com.freelencerhub.common.exception;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class ErrorResponseTest {

    @Test
    void testErrorResponse() {
        LocalDateTime now = LocalDateTime.now();
        Map<String, String> errors = new HashMap<>();
        errors.put("field", "error");

        ErrorResponse response = ErrorResponse.builder()
                .status(400)
                .message("Bad Request")
                .timestamp(now)
                .errors(errors)
                .build();

        assertEquals(400, response.getStatus());
        assertEquals("Bad Request", response.getMessage());
        assertEquals(now, response.getTimestamp());
        assertEquals(errors, response.getErrors());

        ErrorResponse empty = new ErrorResponse();
        empty.setStatus(500);
        assertEquals(500, empty.getStatus());
        
        assertNotNull(response.toString());
        assertTrue(response.equals(response));
    }
}
