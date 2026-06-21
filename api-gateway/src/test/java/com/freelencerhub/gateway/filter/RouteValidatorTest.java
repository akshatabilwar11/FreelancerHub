package com.freelencerhub.gateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.server.reactive.ServerHttpRequest;
import java.net.URI;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RouteValidatorTest {

    private RouteValidator routeValidator;

    @BeforeEach
    void setUp() {
        routeValidator = new RouteValidator();
    }

    @Test
    void isSecured_ReturnsFalseForOpenEndpoints() {
        ServerHttpRequest request = mock(ServerHttpRequest.class);
        when(request.getURI()).thenReturn(URI.create("http://localhost:8080/auth/login"));
        
        assertFalse(routeValidator.isSecured.test(request));
    }

    @Test
    void isSecured_ReturnsTrueForSecuredEndpoints() {
        ServerHttpRequest request = mock(ServerHttpRequest.class);
        when(request.getURI()).thenReturn(URI.create("http://localhost:8080/user/profile"));
        
        assertTrue(routeValidator.isSecured.test(request));
    }
}
