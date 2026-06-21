package com.freelencerhub.user.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserEntityTest {

    @Test
    void testUserPOJO() {
        User user = new User();
        user.setId(1L);
        user.setName("Alice");
        user.setEmail("alice@example.com");
        user.setRole("DEVELOPER");

        assertEquals(1L, user.getId());
        assertEquals("Alice", user.getName());
        assertEquals("alice@example.com", user.getEmail());
        assertEquals("DEVELOPER", user.getRole());

        User user2 = new User(1L, "Alice", "alice@example.com", "DEVELOPER", null, 90);
        assertEquals(user, user2);
        assertEquals(user.hashCode(), user2.hashCode());
        assertNotNull(user.toString());
    }
}
