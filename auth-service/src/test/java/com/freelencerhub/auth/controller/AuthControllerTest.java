package com.freelencerhub.auth.controller;

import com.freelencerhub.auth.dto.AuthRequest;
import com.freelencerhub.auth.dto.UserDTO;
import com.freelencerhub.auth.model.Role;
import com.freelencerhub.auth.model.User;
import com.freelencerhub.auth.repository.RoleRepository;
import com.freelencerhub.auth.repository.UserRepository;
import com.freelencerhub.auth.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
    @Mock
    private org.springframework.web.client.RestTemplate restTemplate;

    @Mock
    private AuthenticationManager authManager;

    @Mock
    private UserRepository userRepo;

    @Mock
    private RoleRepository roleRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private com.freelencerhub.auth.service.EmailService emailService;

    @InjectMocks
    private AuthController authController;

    private final String adminVerificationCode = "SECRET123";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authController, "adminVerificationCode", adminVerificationCode);
    }

    @Test
    void register_Success() {
        AuthRequest req = new AuthRequest("User", "test@test.com", "Password@123", "USER");
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(roleRepo.findByName("USER")).thenReturn(Optional.of(new Role(1L, "USER")));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        ResponseEntity<Map<String, String>> response = authController.register(req);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(userRepo).save(any(User.class));
    }

    @Test
    void register_EmailExists() {
        AuthRequest req = new AuthRequest("User", "test@test.com", "Password@123", "USER");
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.of(new User()));
        ResponseEntity<Map<String, String>> response = authController.register(req);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void register_BadPassword() {
        AuthRequest req = new AuthRequest("User", "test@test.com", "weak", "USER");
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
        ResponseEntity<Map<String, String>> response = authController.register(req);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void login_Success() {
        AuthRequest req = new AuthRequest("User", "test@test.com", "Password@123", "USER");
        User user = new User();
        user.setEmail("test@test.com");
        when(authManager.authenticate(any())).thenReturn(null);
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(any())).thenReturn("token");

        ResponseEntity<Map<String, String>> response = authController.login(req);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void login_BadCredentials() {
        AuthRequest req = new AuthRequest("User", "test@test.com", "Password@123", "USER");
        when(authManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad"));
        ResponseEntity<Map<String, String>> response = authController.login(req);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void login_UserNotFoundAfterAuth() {
        AuthRequest req = new AuthRequest("User", "test@test.com", "Password@123", "USER");
        when(authManager.authenticate(any())).thenReturn(null);
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> authController.login(req));
    }

    @Test
    void getProfile_Success() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("test@test.com");
        user.setRoles(Collections.singleton(new Role(1L, "USER")));
        when(jwtUtil.extractUsername(anyString())).thenReturn("test@test.com");
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.of(user));

        ResponseEntity<UserDTO> response = authController.getProfile("Bearer token");
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getProfile_NoAuthHeader() {
        ResponseEntity<UserDTO> response = authController.getProfile(null);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void viewAllUsers_Success() {
        User user = new User();
        user.setRoles(Collections.singleton(new Role(1L, "USER")));
        when(userRepo.findAll()).thenReturn(Collections.singletonList(user));
        ResponseEntity<List<UserDTO>> response = authController.viewAllUsers();
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void deleteUser_Success() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(new User()));
        ResponseEntity<Map<String, String>> response = authController.deleteUser(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepo).delete(any(User.class));
    }

    @Test
    void deleteUser_NotFound() {
        when(userRepo.findById(1L)).thenReturn(Optional.empty());
        ResponseEntity<Map<String, String>> response = authController.deleteUser(1L);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateUser_Success() {
        User user = new User();
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        ResponseEntity<Map<String, String>> response = authController.updateUser(1L, new UserDTO(1L, "Name", "email", null));
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepo).save(any(User.class));
    }

    @Test
    void updateUser_NotFound() {
        when(userRepo.findById(1L)).thenReturn(Optional.empty());
        ResponseEntity<Map<String, String>> response = authController.updateUser(1L, new UserDTO());
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void registerAdmin_Success() {
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(roleRepo.findByName(anyString())).thenReturn(Optional.of(new Role(1L, "ADMIN")));
        
        Map<String, String> body = new HashMap<>();
        body.put("name", "Admin");
        body.put("email", "admin@test.com");
        body.put("password", "Password@123");
        body.put("code", adminVerificationCode);

        ResponseEntity<Map<String, String>> response = authController.registerAdmin(body);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(userRepo).save(any(User.class));
    }

    @Test
    void registerAdmin_InvalidCode() {
        Map<String, String> body = new HashMap<>();
        body.put("email", "admin@test.com");
        body.put("password", "Password@123");
        body.put("code", "WRONG");

        ResponseEntity<Map<String, String>> response = authController.registerAdmin(body);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void registerAdmin_EmailExists() {
        Map<String, String> body = new HashMap<>();
        body.put("email", "admin@test.com");
        body.put("password", "Password@123");
        body.put("code", adminVerificationCode);
        
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.of(new User()));
        ResponseEntity<Map<String, String>> response = authController.registerAdmin(body);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void registerAdmin_BadPassword() {
        Map<String, String> body = new HashMap<>();
        body.put("email", "admin@test.com");
        body.put("password", "weak");
        body.put("code", adminVerificationCode);
        
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
        ResponseEntity<Map<String, String>> response = authController.registerAdmin(body);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void register_NewRoleCreated() {
        AuthRequest req = new AuthRequest("User", "test@test.com", "Password@123", "USER");
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(roleRepo.findByName("USER")).thenReturn(Optional.empty());
        when(roleRepo.save(any(Role.class))).thenReturn(new Role(1L, "USER"));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        ResponseEntity<Map<String, String>> response = authController.register(req);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(roleRepo).save(any(Role.class));
    }

    @Test
    void registerAdmin_NewRoleCreated() {
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(roleRepo.findByName("ADMIN")).thenReturn(Optional.empty());
        when(roleRepo.save(any(Role.class))).thenReturn(new Role(2L, "ADMIN"));
        
        Map<String, String> body = new HashMap<>();
        body.put("name", "Admin");
        body.put("email", "admin@test.com");
        body.put("password", "Password@123");
        body.put("code", adminVerificationCode);

        ResponseEntity<Map<String, String>> response = authController.registerAdmin(body);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(roleRepo).save(any(Role.class));
    }

    @Test
    void getProfile_UserNotFoundInDb() {
        when(jwtUtil.extractUsername(anyString())).thenReturn("test@test.com");
        when(userRepo.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authController.getProfile("Bearer token"));
    }

    @Test
    void getUserById_Success() {
        User user = new User();
        user.setUserId(1L);
        user.setRoles(Collections.singleton(new Role(1L, "USER")));
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));

        ResponseEntity<UserDTO> response = authController.getUserById(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getUserById_NotFound() {
        when(userRepo.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<UserDTO> response = authController.getUserById(1L);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void forgotPassword_Success() {
        User user = new User();
        user.setEmail("test@test.com");
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        doNothing().when(emailService).sendOtpEmail(anyString(), anyString());

        Map<String, String> body = Collections.singletonMap("email", "test@test.com");
        ResponseEntity<Map<String, String>> response = authController.forgotPassword(body);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(emailService).sendOtpEmail(eq("test@test.com"), anyString());
    }

    @Test
    void forgotPassword_UserNotFound() {
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.empty());

        Map<String, String> body = Collections.singletonMap("email", "test@test.com");
        ResponseEntity<Map<String, String>> response = authController.forgotPassword(body);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void forgotPassword_Exception() {
        when(userRepo.findByEmail("test@test.com")).thenThrow(new RuntimeException("DB Error"));

        Map<String, String> body = Collections.singletonMap("email", "test@test.com");
        ResponseEntity<Map<String, String>> response = authController.forgotPassword(body);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void verifyOtp_Success() {
        User user = new User();
        user.setOtp("123456");
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        com.freelencerhub.auth.dto.OtpRequest req = new com.freelencerhub.auth.dto.OtpRequest();
        req.setEmail("test@test.com");
        req.setOtp("123456");

        ResponseEntity<Map<String, String>> response = authController.verifyOtp(req);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void verifyOtp_Invalid() {
        User user = new User();
        user.setOtp("123456");
        user.setOtpExpiry(java.time.LocalDateTime.now().minusMinutes(5)); // expired
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        com.freelencerhub.auth.dto.OtpRequest req = new com.freelencerhub.auth.dto.OtpRequest();
        req.setEmail("test@test.com");
        req.setOtp("123456");

        ResponseEntity<Map<String, String>> response = authController.verifyOtp(req);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void resetPassword_Success() {
        User user = new User();
        user.setOtp("123456");
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPassword@123")).thenReturn("encoded");

        com.freelencerhub.auth.dto.ResetPasswordRequest req = new com.freelencerhub.auth.dto.ResetPasswordRequest();
        req.setEmail("test@test.com");
        req.setOtp("123456");
        req.setNewPassword("NewPassword@123");

        ResponseEntity<Map<String, String>> response = authController.resetPassword(req);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepo).save(user);
    }

    @Test
    void resetPassword_WeakPassword() {
        User user = new User();
        user.setOtp("123456");
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        com.freelencerhub.auth.dto.ResetPasswordRequest req = new com.freelencerhub.auth.dto.ResetPasswordRequest();
        req.setEmail("test@test.com");
        req.setOtp("123456");
        req.setNewPassword("weak");

        ResponseEntity<Map<String, String>> response = authController.resetPassword(req);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void resetPassword_InvalidOtp() {
        when(userRepo.findByEmail("test@test.com")).thenReturn(Optional.empty());

        com.freelencerhub.auth.dto.ResetPasswordRequest req = new com.freelencerhub.auth.dto.ResetPasswordRequest();
        req.setEmail("test@test.com");
        req.setOtp("123456");
        req.setNewPassword("NewPassword@123");

        ResponseEntity<Map<String, String>> response = authController.resetPassword(req);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
