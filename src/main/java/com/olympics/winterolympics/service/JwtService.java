package com.olympics.winterolympics.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.olympics.winterolympics.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final ObjectMapper objectMapper;

    @Value("${app.jwt.secret:change-this-development-secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-seconds:86400}")
    private long expirationSeconds;

    public String generateToken(User user) {

        Instant now =
                Instant.now();

        List<String> roles =
                user.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList();

        Map<String, Object> header =
                Map.of(
                        "alg", "HS256",
                        "typ", "JWT"
                );

        Map<String, Object> payload =
                Map.of(
                        "sub", user.getUsername(),
                        "preferred_username", user.getUsername(),
                        "roles", roles,
                        "iat", now.getEpochSecond(),
                        "exp", now.plusSeconds(expirationSeconds)
                                .getEpochSecond()
                );

        String encodedHeader =
                encodeJson(header);

        String encodedPayload =
                encodeJson(payload);

        String unsignedToken =
                encodedHeader + "." + encodedPayload;

        return unsignedToken + "." + sign(unsignedToken);
    }

    public String extractUsername(String token) {

        return getPayload(token)
                .get("sub")
                .toString();
    }

    public boolean isValid(String token) {

        try {
            String[] parts =
                    token.split("\\.");

            if (parts.length != 3) {
                return false;
            }

            String unsignedToken =
                    parts[0] + "." + parts[1];

            if (!sign(unsignedToken).equals(parts[2])) {
                return false;
            }

            Number expiration =
                    (Number) getPayload(token)
                            .get("exp");

            return expiration.longValue()
                    > Instant.now().getEpochSecond();
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private Map<String, Object> getPayload(String token) {

        try {
            String payload =
                    new String(
                            Base64.getUrlDecoder()
                                    .decode(token.split("\\.")[1]),
                            StandardCharsets.UTF_8
                    );

            return objectMapper.readValue(
                    payload,
                    new TypeReference<>() {
                    }
            );
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid JWT token");
        }
    }

    private String encodeJson(Map<String, Object> value) {

        try {
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(
                            objectMapper.writeValueAsBytes(value)
                    );
        } catch (Exception ex) {
            throw new IllegalStateException("Could not encode JWT");
        }
    }

    private String sign(String value) {

        try {
            Mac mac =
                    Mac.getInstance(HMAC_ALGORITHM);

            mac.init(new SecretKeySpec(
                    jwtSecret.getBytes(StandardCharsets.UTF_8),
                    HMAC_ALGORITHM
            ));

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(
                            mac.doFinal(
                                    value.getBytes(StandardCharsets.UTF_8)
                            )
                    );
        } catch (Exception ex) {
            throw new IllegalStateException("Could not sign JWT");
        }
    }
}
