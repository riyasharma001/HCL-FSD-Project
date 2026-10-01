package com.ordercraft.controller;

<<<<<<< HEAD
import com.ordercraft.config.JwtService;
import com.ordercraft.model.User;
import com.ordercraft.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

=======
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

>>>>>>> 74ea1c64538c61d40779212c657caf7dd6277212
@RestController
@RequestMapping("/api")
public class LoginController {

<<<<<<< HEAD
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public LoginController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping({"/login", "/auth/login"})
    public ResponseEntity<?> login(@RequestBody Map<String, String> login) {
        String username = login.get("username");
        String password = login.get("password");

        if (username == null || password == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Username and password are required"));
        }

        Optional<User> userOpt = userRepository.findByUsername(username.trim());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (password.equals(user.password)) {
                String token = jwtService.generateToken(user.username, user.role, user.fullName);
                Map<String, Object> resp = new HashMap<>();
                resp.put("token", token);
                resp.put("username", user.username);
                resp.put("role", user.role);
                resp.put("fullName", user.fullName);
                resp.put("message", "Login successful");
                return ResponseEntity.ok(resp);
            }
        } else if ("admin".equals(username) && "admin123".equals(password)) {
            // Built-in fallback administrator
            String token = jwtService.generateToken("admin", "ADMIN", "Administrator");
            Map<String, Object> resp = new HashMap<>();
            resp.put("token", token);
            resp.put("username", "admin");
            resp.put("role", "ADMIN");
            resp.put("fullName", "System Administrator");
            resp.put("message", "Login successful");
            return ResponseEntity.ok(resp);
=======
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> login) {

        String username = login.get("username");
        String password = login.get("password");

        if ("admin".equals(username) && "admin123".equals(password)) {
            return ResponseEntity.ok(
                Map.of("message", "Login successful")
            );
>>>>>>> 74ea1c64538c61d40779212c657caf7dd6277212
        }

        return ResponseEntity.status(401)
                .body(Map.of("error", "Invalid username or password"));
    }
<<<<<<< HEAD

    @GetMapping("/auth/me")
    public ResponseEntity<?> me(@RequestAttribute(value = "username", required = false) String username,
                                @RequestAttribute(value = "role", required = false) String role) {
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(Map.of("username", username, "role", role != null ? role : "USER"));
    }
=======
>>>>>>> 74ea1c64538c61d40779212c657caf7dd6277212
}