package com.freelencerhub.auth.model;

import org.junit.jupiter.api.Test;
import java.util.HashSet;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class ModelTest {

    @Test
    void testUserPOJO() {
        User user = new User();
        user.setUserId(1L);
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setPassword("password");
        
        Role role = new Role(1L, "ROLE_USER");
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        assertEquals(1L, user.getUserId());
        assertEquals("John Doe", user.getName());
        assertEquals("john@example.com", user.getEmail());
        assertEquals("password", user.getPassword());
        assertEquals(roles, user.getRoles());
        
        User user2 = new User(1L, "John Doe", "john@example.com", "password", null, null, roles);
        assertEquals(user, user2);
        assertEquals(user.hashCode(), user2.hashCode());
        assertNotNull(user.toString());
    }

    @Test
    void testRolePOJO() {
        Role role = new Role();
        role.setId(1L);
        role.setName("ROLE_ADMIN");

        assertEquals(1L, role.getId());
        assertEquals("ROLE_ADMIN", role.getName());
        
        Role role2 = new Role(1L, "ROLE_ADMIN");
        assertEquals(role, role2);
        assertEquals(role.hashCode(), role2.hashCode());
        assertNotNull(role.toString());
    }
}
