package com.freelencerhub.auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class CustomWebSecurityConfigTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void securityBeansLoaded() {
        assertNotNull(context.getBean(SecurityFilterChain.class));
        assertNotNull(context.getBean(AuthenticationManager.class));
        assertNotNull(context.getBean(PasswordEncoder.class));
    }
}
