package com.ordercraft.config;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@Component
@Order(1)
public class AuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public AuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. Allow preflight OPTIONS requests for CORS
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Allow public endpoints (login, static assets, h2-console)
        if (!path.startsWith("/api") || path.equals("/api/login") || path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract and validate Bearer token
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Map<String, String> claims = jwtService.validateAndExtract(token);
            if (claims != null) {
                request.setAttribute("username", claims.get("sub"));
                request.setAttribute("role", claims.get("role"));
                filterChain.doFilter(request, response);
                return;
            }
        }

        // 4. Deny unauthorized request
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"Unauthorized: Invalid or missing authentication token. Please sign in.\"}");
    }
}
