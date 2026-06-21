package com.freelencerhub.user.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testUserEntity() {
        User user = new User();
        user.setId(1L);
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setRole("FREELANCER");

        assertEquals(1L, user.getId());
        assertEquals("John Doe", user.getName());
        assertEquals("john@example.com", user.getEmail());
        assertEquals("FREELANCER", user.getRole());

        User userAll = new User(2L, "Jane", "jane@example.com", "CLIENT", null, 90);
        assertEquals(2L, userAll.getId());
        
        assertNotNull(user.toString());
        assertNotEquals(0, user.hashCode());
        assertTrue(user.equals(user));
        assertFalse(user.equals(null));
    }
}
