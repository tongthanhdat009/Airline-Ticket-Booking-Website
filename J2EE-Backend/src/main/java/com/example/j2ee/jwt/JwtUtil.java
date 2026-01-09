package com.example.j2ee.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    // [MODIFIED] Tách thời hạn thành 2 loại
    @Value("${jwt.access-expiration}")     // milliseconds
    private long accessExpiration;         // [ADDED]

    @Value("${jwt.refresh-expiration}")    // milliseconds
    private long refreshExpiration;        // [ADDED]

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /* ================== ACCESS TOKEN ================== */

    // [ADDED] Access token có typ=access
    public String generateAccessToken(String subject) {
        return build(subject, accessExpiration, Collections.singletonMap("typ", "access"));
    }

    // [ADDED]
    public String generateAccessToken(String subject, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", "access");
        claims.put("role", role);
        return build(subject, accessExpiration, claims);
    }

    // [ADDED]
    public String generateAccessToken(String subject, Map<String, Object> extraClaims) {
        Map<String, Object> claims = new HashMap<>(Optional.ofNullable(extraClaims).orElse(Collections.emptyMap()));
        claims.put("typ", "access");
        return build(subject, accessExpiration, claims);
    }

    /* ================== REFRESH TOKEN ================== */

    // [ADDED] Refresh token có typ=refresh + jti
    public String generateRefreshToken(String subject) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", "refresh");
        claims.put("jti", UUID.randomUUID().toString());
        return build(subject, refreshExpiration, claims);
    }

    // [ADDED] Kiểm tra có phải refresh token hợp lệ hay không
    public boolean isRefreshToken(String token) {
        try {
            String typ = getClaim(token, c -> c.get("typ", String.class));
            return "refresh".equals(typ) && validate(token);
        } catch (Exception e) {
            return false;
        }
    }

    /* ================== COMMON ================== */

    // [MODIFIED] dùng chung cho cả access/refresh
    private String build(String subject, long ttl, Map<String, Object> claims) {
        long now = System.currentTimeMillis();
        JwtBuilder b = Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + ttl))
                .signWith(key, SignatureAlgorithm.HS256);
        if (claims != null && !claims.isEmpty()) b.addClaims(claims);
        return b.compact();
    }

    public String getSubject(String token) {
        return getClaim(token, Claims::getSubject);
    }

    public String getRole(String token) {
        String role = getClaim(token, c -> c.get("role", String.class));
        if (role != null) return role;

        List<?> roles = getClaim(token, c -> c.get("roles", List.class));
        if (roles != null && !roles.isEmpty() && roles.get(0) != null) {
            return roles.get(0).toString();
        }
        return null;
    }

    public Object getClaim(String token, String name) {
        return getAllClaims(token).get(name);
    }

    public <T> T getClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(getAllClaims(token));
    }

    public boolean validate(String token) {
        try {
            return !isTokenExpired(token); // parseClaimsJws() đã verify chữ ký
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        Date exp = getClaim(token, Claims::getExpiration);
        return exp.before(new Date());
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

