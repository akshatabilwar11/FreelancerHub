package com.freelencerhub.auth.security;

import com.freelencerhub.auth.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
    }

    @Test
    void generateToken_Success() {
        User user = new User();
        user.setEmail("test@test.com");
        String token = jwtUtil.generateToken(user);
        assertNotNull(token);
        assertEquals("test@test.com", jwtUtil.extractUsername(token));
    }

    @Test
    void validateToken_Success() {
        User user = new User();
        user.setEmail("test@test.com");
        String token = jwtUtil.generateToken(user);
        assertDoesNotThrow(() -> jwtUtil.validateToken(token));
    }

    @Test
    void validateToken_Invalid() {
        assertThrows(Exception.class, () -> jwtUtil.validateToken("invalid.token.here"));
    }

    @Test
    void extractClaim_Success() {
        User user = new User();
        user.setEmail("test@test.com");
        String token = jwtUtil.generateToken(user);
        String subject = jwtUtil.extractClaim(token, Claims::getSubject);
        assertEquals("test@test.com", subject);
    }
}
