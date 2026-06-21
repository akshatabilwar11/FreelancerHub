package com.freelencerhub.auth.dto;

import org.junit.jupiter.api.Test;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class DTOTest {

    @Test
    void testAuthRequestPOJO() {
        AuthRequest request = new AuthRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setRole("USER");

        assertEquals("Test User", request.getName());
        assertEquals("test@example.com", request.getEmail());
        assertEquals("password123", request.getPassword());
        assertEquals("USER", request.getRole());

        AuthRequest request2 = new AuthRequest("Test User", "test@example.com", "password123", "USER");
        assertEquals(request, request2);
    }

    @Test
    void testUserDTOPOJO() {
        List<String> roles = Arrays.asList("ROLE_USER", "ROLE_ADMIN");
        UserDTO dto = new UserDTO();
        dto.setId(1L);
        dto.setName("Admin");
        dto.setEmail("admin@example.com");
        dto.setRoles(roles);

        assertEquals(1L, dto.getId());
        assertEquals("Admin", dto.getName());
        assertEquals("admin@example.com", dto.getEmail());
        assertEquals(roles, dto.getRoles());

        UserDTO dto2 = new UserDTO(1L, "Admin", "admin@example.com", roles);
        assertEquals(dto, dto2);
    }
}
