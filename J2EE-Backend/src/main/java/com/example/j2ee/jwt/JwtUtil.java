package com.example.j2ee.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /* ================== ACCESS TOKEN ================== */

    public String generateAccessToken(String subject) {
        return build(subject, accessExpiration, Collections.singletonMap("typ", "access"));
    }

    public String generateAccessToken(String subject, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", "access");
        claims.put("role", role);
        return build(subject, accessExpiration, claims);
    }

    public String generateAccessToken(String subject, Collection<String> roles) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", "access");
        claims.put("roles", roles);
        return build(subject, accessExpiration, claims);
    }

    public String generateAccessToken(String subject, Collection<String> roles, Collection<String> permissions) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", "access");
        claims.put("roles", roles);
        claims.put("permissions", permissions);
        return build(subject, accessExpiration, claims);
    }

    public String generateAccessToken(String subject, Map<String, Object> extraClaims) {
        Map<String, Object> claims = new HashMap<>(Optional.ofNullable(extraClaims).orElse(Collections.emptyMap()));
        claims.put("typ", "access");
        return build(subject, accessExpiration, claims);
    }

    /* ================== REFRESH TOKEN ================== */

    public String generateRefreshToken(String subject) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", "refresh");
        claims.put("jti", UUID.randomUUID().toString());
        return build(subject, refreshExpiration, claims);
    }

    public boolean isRefreshToken(String token) {
        try {
            String typ = getClaim(token, c -> c.get("typ", String.class));
            return "refresh".equals(typ) && validate(token);
        } catch (Exception e) {
            return false;
        }
    }

    /* ================== COMMON ================== */

    private String build(String subject, long ttl, Map<String, Object> claims) {
        long now = System.currentTimeMillis();
        var builder = Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + ttl))
                .signWith(key, SignatureAlgorithm.HS256);
        if (claims != null && !claims.isEmpty()) {
            builder.addClaims(claims);
        }
        return builder.compact();
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

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        List<String> roles = getClaim(token, c -> c.get("roles", List.class));
        if (roles != null) {
            return roles;
        }

        // Fallback: nếu có role đơn, convert thành list
        String singleRole = getClaim(token, c -> c.get("role", String.class));
        if (singleRole != null) {
            return Collections.singletonList(singleRole);
        }

        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    public List<String> getPermissions(String token) {
        List<String> permissions = getClaim(token, c -> c.get("permissions", List.class));
        return permissions != null ? permissions : Collections.emptyList();
    }

    public Object getClaim(String token, String name) {
        return getAllClaims(token).get(name);
    }

    public <T> T getClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(getAllClaims(token));
    }

    public boolean validate(String token) {
        try {
            return !isTokenExpired(token);
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

