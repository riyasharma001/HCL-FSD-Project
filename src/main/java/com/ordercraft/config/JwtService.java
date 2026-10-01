package com.ordercraft.config;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final String SECRET_KEY = "OrderCraftSecretKeyForJwtAuthenticationSecurityToken2026!";
    private static final long EXPIRATION_MILLIS = 24 * 60 * 60 * 1000L; // 24 hours

    public String generateToken(String username, String role, String fullName) {
        long now = System.currentTimeMillis();
        long exp = now + EXPIRATION_MILLIS;

        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = String.format("{\"sub\":\"%s\",\"role\":\"%s\",\"name\":\"%s\",\"iat\":%d,\"exp\":%d}",
                escape(username), escape(role), escape(fullName != null ? fullName : username), now / 1000, exp / 1000);

        String encodedHeader = base64UrlEncode(header.getBytes(StandardCharsets.UTF_8));
        String encodedPayload = base64UrlEncode(payload.getBytes(StandardCharsets.UTF_8));

        String contentToSign = encodedHeader + "." + encodedPayload;
        String signature = sign(contentToSign, SECRET_KEY);

        return contentToSign + "." + signature;
    }

    public Map<String, String> validateAndExtract(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }

        String[] parts = token.trim().split("\\.");
        if (parts.length != 3) {
            return null;
        }

        String encodedHeader = parts[0];
        String encodedPayload = parts[1];
        String signature = parts[2];

        String expectedSignature = sign(encodedHeader + "." + encodedPayload, SECRET_KEY);
        if (!MessageDigest.isEqual(signature.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            return null;
        }

        try {
            String jsonPayload = new String(base64UrlDecode(encodedPayload), StandardCharsets.UTF_8);
            Map<String, String> claims = parseSimpleJson(jsonPayload);

            if (claims.containsKey("exp")) {
                long exp = Long.parseLong(claims.get("exp"));
                if (System.currentTimeMillis() / 1000 > exp) {
                    return null; // Expired
                }
            }
            return claims;
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data, String key) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] signedBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(signedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error signing token", e);
        }
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private byte[] base64UrlDecode(String str) {
        return Base64.getUrlDecoder().decode(str);
    }

    private String escape(String s) {
        return s.replace("\"", "\\\"");
    }

    private Map<String, String> parseSimpleJson(String json) {
        Map<String, String> map = new HashMap<>();
        String trimmed = json.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        String[] pairs = trimmed.split(",");
        for (String pair : pairs) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                String k = kv[0].trim().replace("\"", "");
                String v = kv[1].trim().replace("\"", "");
                map.put(k, v);
            }
        }
        return map;
    }
}
