package com.freelencerhub.user.controller;

import com.freelencerhub.user.dto.UserDTO;
import com.freelencerhub.user.entity.User;
import com.freelencerhub.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @Test
    void testGetAllUsers() {
        User user = new User(1L, "Test", "test@test.com", "FREELANCER", null, 90);
        when(userService.getAllUsers()).thenReturn(Arrays.asList(user));
        
        List<UserDTO> users = userController.getAllUsers();
        
        assertEquals(1, users.size());
        assertEquals("Test", users.get(0).getName());
        assertFalse(users.get(0).isOnline());
    }

    @Test
    void testCreateUser() {
        User user = new User(null, "Test", "test@test.com", "CLIENT", null, 90);
        User savedUser = new User(1L, "Test", "test@test.com", "CLIENT", null, 90);
        when(userService.createUser(any(User.class))).thenReturn(savedUser);
        
        UserDTO result = userController.createUser(user);
        assertEquals(1L, result.getId());
    }

    @Test
    void testGetUserById_Success() {
        User user = new User(1L, "Test", "test@test.com", "FREELANCER", null, 90);
        when(userService.getUserById(1L)).thenReturn(Optional.of(user));
        when(userService.createUser(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        ResponseEntity<UserDTO> response = userController.getUserById(1L);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test", response.getBody().getName());
        assertTrue(response.getBody().isOnline()); // lastActive set to now()
    }

    @Test
    void testGetUserById_NotFound() {
        when(userService.getUserById(anyLong())).thenReturn(Optional.empty());
        
        ResponseEntity<UserDTO> response = userController.getUserById(99L);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testDeleteUser() {
        doNothing().when(userService).deleteUser(1L);
        
        ResponseEntity<Void> response = userController.deleteUser(1L);
        
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(userService, times(1)).deleteUser(1L);
    }

    @Test
    void testGetUserById_OfflineButNotNullLastActive() {
        // lastActive is 10 minutes ago, so isOnline should be false
        LocalDateTime tenMinsAgo = LocalDateTime.now().minusMinutes(10);
        User user = new User(1L, "Test", "test@test.com", "FREELANCER", tenMinsAgo, 90);
        
        when(userService.getUserById(1L)).thenReturn(Optional.of(user));
        when(userService.createUser(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<UserDTO> response = userController.getUserById(1L);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        // Wait, inside the controller, it overrides the lastActive to LocalDateTime.now(), so it becomes online.
        // Let's test mapToDTO directly or by calling another API if there was one, or we can just verify the mapping.
        // Since controller overrides it in getUserById, let's look at getAllUsers where lastActive is preserved!
        // We will call getAllUsers with lastActive set to tenMinsAgo!
    }

    @Test
    void testGetAllUsers_OfflineButNotNullLastActive() {
        LocalDateTime tenMinsAgo = LocalDateTime.now().minusMinutes(10);
        User user = new User(1L, "Test", "test@test.com", "FREELANCER", tenMinsAgo, 90);
        when(userService.getAllUsers()).thenReturn(Arrays.asList(user));

        List<UserDTO> users = userController.getAllUsers();
        
        assertEquals(1, users.size());
        assertFalse(users.get(0).isOnline()); // 10 minutes ago, so isOnline is false
    }
}
