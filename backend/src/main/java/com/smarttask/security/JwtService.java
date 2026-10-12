package com.smarttask.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs) {

        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "JWTSECRET is missing or empty. Set it in Railway Variables."
            );
        }

        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);

        if (secretBytes.length < 32) {
            throw new IllegalArgumentException(
                "JWTSECRET must be at least 32 bytes for HS256-compatible keys."
            );
        }

        if (expirationMs <= 0) {
            throw new IllegalArgumentException(
                "JWTEXPIRATIONMS must be greater than zero."
            );
        }

        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email) {
        Date now = new Date();

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token, String expectedEmail) {
        try {
            return expectedEmail != null && expectedEmail.equals(extractEmail(token));
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}