package com.freelencerhub.gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = Arrays.asList(
            "/auth/register",
            "/auth/login",
            "/auth/forgot-password",
            "/auth/verify-otp",
            "/auth/reset-password",
            "/eureka",
            "/actuator",
            "/swagger-ui",
            "/swagger-resources",
            "/v3/api-docs",
            "/webjars"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> {
                String path = request.getURI().getPath();
                return openApiEndpoints
                        .stream()
                        .noneMatch(uri -> path.contains(uri));
            };

}
