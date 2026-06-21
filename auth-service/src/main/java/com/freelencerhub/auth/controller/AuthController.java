package com.freelencerhub.auth.controller;

import com.freelencerhub.auth.security.JwtUtil;
import com.freelencerhub.auth.dto.UserDTO;
import com.freelencerhub.auth.dto.AuthRequest;
import com.freelencerhub.auth.dto.OtpRequest;
import com.freelencerhub.auth.dto.ResetPasswordRequest;
import com.freelencerhub.auth.model.Role;
import com.freelencerhub.auth.model.User;
import com.freelencerhub.auth.repository.RoleRepository;
import com.freelencerhub.auth.repository.UserRepository;
import com.freelencerhub.auth.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Value("${admin.verification.code:SECRET123}")
    private String adminVerificationCode;

    private final RestTemplate restTemplate;

    private static final String ERROR_KEY = "error";
    private static final String MSG_KEY = "msg";

    private static final Pattern PASSWORD_PATTERN = 
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$");

    @Autowired
    public AuthController(AuthenticationManager authManager, UserRepository userRepo, RoleRepository roleRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, EmailService emailService, RestTemplate restTemplate) {
        this.authManager = authManager;
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.restTemplate = restTemplate;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody AuthRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap(ERROR_KEY, "Email already registered!"));
        }

        if (!PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap(ERROR_KEY,
                    "Password must be at least 8 letters with upper, lower, number, and special character."));
        }

        String requestedRole = (request.getRole() != null) ? request.getRole().toUpperCase() : "USER";
        Role userRole = roleRepo.findByName(requestedRole)
                .orElseGet(() -> roleRepo.save(new Role(null, requestedRole)));

        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRoles(Collections.singleton(userRole));

        userRepo.save(newUser);

        // Sync with User Service
        try {
            Map<String, Object> userSyncData = new HashMap<>();
            userSyncData.put("name", newUser.getName());
            userSyncData.put("email", newUser.getEmail());
            userSyncData.put("role", requestedRole);
            userSyncData.put("trustScore", 85);
            restTemplate.postForObject("http://user-service/users", userSyncData, Map.class);
        } catch (Exception e) {
            System.err.println("Failed to sync user with user-service: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap(MSG_KEY, "User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody AuthRequest request) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap(ERROR_KEY, "Invalid email or password."));
        }

        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwt = jwtUtil.generateToken(user);

        return ResponseEntity.ok(Collections.singletonMap("token", jwt));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String jwt = authorizationHeader.substring(7);
        String email = jwtUtil.extractUsername(jwt);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDTO = new UserDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
        );

        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> viewAllUsers() {
        List<User> users = userRepo.findAll();

        List<UserDTO> dtos = users.stream()
                .map(user -> new UserDTO(
                        user.getUserId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            UserDTO userDTO = new UserDTO(
                    user.getUserId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
            );
            return ResponseEntity.ok(userDTO);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isPresent()) {
            userRepo.delete(optionalUser.get());
            return ResponseEntity.ok(Collections.singletonMap(MSG_KEY, "User deleted successfully!"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap(ERROR_KEY, "User not found."));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> updateUser(@PathVariable Long id, @RequestBody UserDTO updatedUser) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            userRepo.save(user);
            return ResponseEntity.ok(Collections.singletonMap(MSG_KEY, "User updated successfully!"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap(ERROR_KEY, "User not found."));
        }
    }

    @PostMapping("/register-admin")
    public ResponseEntity<Map<String, String>> registerAdmin(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String verificationCode = body.get("code");

        if (userRepo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap(ERROR_KEY, "Email already registered!"));
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap(ERROR_KEY,
                    "Password must be at least 8 characters long, include upper/lowercase, number, and special character."));
        }

        if (!adminVerificationCode.equals(verificationCode)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap(ERROR_KEY, "Invalid admin verification code."));
        }

        Role adminRole = roleRepo.findByName("ADMIN")
                .orElseGet(() -> roleRepo.save(new Role(null, "ADMIN")));

        User admin = new User();
        admin.setName(name);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRoles(Collections.singleton(adminRole));

        userRepo.save(admin);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap(MSG_KEY, "Admin registered successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            System.out.println("DEBUG: forgotPassword request for email: " + email);
            
            Optional<User> userOpt = userRepo.findByEmail(email);
            
            if (!userOpt.isPresent()) {
                System.out.println("DEBUG: User not found for email: " + email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap(ERROR_KEY, "No account found with this email."));
            }

            User user = userOpt.get();
            
            String otp = String.format("%06d", new Random().nextInt(999999));
            user.setOtp(otp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(10)); 
            userRepo.save(user);

            emailService.sendOtpEmail(email, otp);
            System.out.println(">>> SUCCESS: OTP for " + email + " is: " + otp);

            return ResponseEntity.ok(Collections.singletonMap(MSG_KEY, "OTP sent to your email."));
        } catch (Exception e) {
            System.err.println("ERROR in forgotPassword: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap(ERROR_KEY, "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody OtpRequest request) {
        Optional<User> userOpt = userRepo.findByEmail(request.getEmail());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getOtp() != null && user.getOtp().equals(request.getOtp()) && 
                user.getOtpExpiry().isAfter(LocalDateTime.now())) {
                return ResponseEntity.ok(Collections.singletonMap(MSG_KEY, "OTP verified successfully!"));
            }
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap(ERROR_KEY, "Invalid or expired OTP."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> userOpt = userRepo.findByEmail(request.getEmail());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getOtp() != null && user.getOtp().equals(request.getOtp()) && 
                user.getOtpExpiry().isAfter(LocalDateTime.now())) {
                
                if (!PASSWORD_PATTERN.matcher(request.getNewPassword()).matches()) {
                    return ResponseEntity.badRequest().body(Collections.singletonMap(ERROR_KEY,
                            "Password must be at least 8 characters long with complexity."));
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                user.setOtp(null); 
                user.setOtpExpiry(null);
                userRepo.save(user);
                
                return ResponseEntity.ok(Collections.singletonMap(MSG_KEY, "Password reset successfully!"));
            }
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap(ERROR_KEY, "Invalid or expired OTP."));
    }
}
