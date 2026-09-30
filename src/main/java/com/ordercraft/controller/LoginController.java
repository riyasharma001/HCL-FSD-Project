package com.ordercraft.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class LoginController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> login) {

        String username = login.get("username");
        String password = login.get("password");

        if ("admin".equals(username) && "admin123".equals(password)) {
            return ResponseEntity.ok(
                Map.of("message", "Login successful")
            );
        }

        return ResponseEntity.status(401)
                .body(Map.of("error", "Invalid username or password"));
    }
}