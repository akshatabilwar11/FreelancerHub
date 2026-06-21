package com.freelencerhub.user.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserDTOTest {

    @Test
    void testUserDTO() {
        UserDTO dto = new UserDTO();
        dto.setId(1L);
        dto.setName("John");
        dto.setEmail("john@example.com");
        dto.setRole("ADMIN");

        assertEquals(1L, dto.getId());
        assertEquals("John", dto.getName());
        assertEquals("john@example.com", dto.getEmail());
        assertEquals("ADMIN", dto.getRole());

        UserDTO dtoAll = new UserDTO(2L, "Jane", "jane@example.com", "CLIENT", false, 90);
        assertEquals(2L, dtoAll.getId());
        
        assertNotNull(dto.toString());
        assertNotEquals(0, dto.hashCode());
        assertTrue(dto.equals(dto));
    }
}
