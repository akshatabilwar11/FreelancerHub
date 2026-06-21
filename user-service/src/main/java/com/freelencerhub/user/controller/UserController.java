package com.freelencerhub.user.controller;

import com.freelencerhub.user.dto.UserDTO;
import com.freelencerhub.user.entity.User;
import com.freelencerhub.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public UserDTO createUser(@Valid @RequestBody User user) {
        return mapToDTO(userService.createUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> {
                    user.setLastActive(LocalDateTime.now());
                    userService.createUser(user); // Save updated lastActive
                    return ResponseEntity.ok(mapToDTO(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    private UserDTO mapToDTO(User user) {
        boolean isOnline = user.getLastActive() != null && 
                           user.getLastActive().isAfter(LocalDateTime.now().minusMinutes(5));
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getRole(), isOnline, user.getTrustScore());
    }
}
