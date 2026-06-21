package com.freelencerhub.payment.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PaymentDTOTest {

    @Test
    void testPaymentDTO() {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(1L);
        dto.setProjectId(10L);
        dto.setFreelancerId(20L);
        dto.setAmount(100.0);
        dto.setStatus("SUCCESS");

        assertEquals(1L, dto.getId());
        assertEquals(10L, dto.getProjectId());
        assertEquals(20L, dto.getFreelancerId());
        assertEquals(100.0, dto.getAmount());
        assertEquals("SUCCESS", dto.getStatus());

        PaymentDTO dtoAll = new PaymentDTO(2L, 11L, 21L, 200.0, "FAILED", null);
        assertEquals(2L, dtoAll.getId());
        
        assertNotNull(dto.toString());
        assertNotEquals(0, dto.hashCode());
        assertTrue(dto.equals(dto));
    }
}
