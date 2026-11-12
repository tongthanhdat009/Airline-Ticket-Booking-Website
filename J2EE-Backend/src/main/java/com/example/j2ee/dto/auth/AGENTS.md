<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/auth

## Purpose
Payloads for the customer authentication flow: login, token refresh, email verification, and password reset via OTP.

## Key Files
| File | Description |
|------|-------------|
| `LoginRequest.java` | Customer login payload: `email` + `matKhau`. |
| `LoginResponse.java` | Login result: `message`, `accessToken`, `refreshToken`. |
| `RefreshTokenRequest.java` | Carries the refresh token to exchange. |
| `RefreshTokenResponse.java` | New `accessToken` + `refreshToken` pair after rotation. |
| `SendVerificationRequest.java` | Email to send the verification link to. |
| `VerifyOtpRequest.java` | Email + OTP pair for verification and reset confirmation. |
| `ResetPasswordRequest.java` | Email + OTP + `newPassword` for the reset step. |
| `ForgotPasswordRequest.java` | Email only, used to start the reset flow. |
| `UserInfoResponse.java` | Minimal current-user view: `email`, `role`, `isAuthenticated`. |

## For AI Agents

### Working In This Directory
- These DTOs are shared by customer and admin login flows; admin login reuses the same field names (`email`/`matKhau`) — keep them aligned.
- Passwords are only ever outbound fields (`matKhau`, `newPassword`); no response DTO carries a credential.
- Token fields are plain strings — the caller sends the refresh token in the body, never in a query string.

### Testing Requirements
- Login/refresh round-trip belongs in a controller test; OTP flows are covered by `src/test/java/com/example/j2ee/service/ForgotPasswordServiceTest.java`.
- Assert that no DTO serializes the password hash.

### Common Patterns
- Vietnamese `@NotBlank` messages on required fields.
- Validation failures become 400 with a field→message map via `GlobalExceptionHandler`.

## Dependencies

### Internal
- `../../service/DangNhapService.java`, `../../service/RefreshTokenService.java`, `../../service/ForgotPasswordService.java`, `../../service/EmailVerificationService.java` - the flows these payloads drive.

### External
- Jakarta Validation - bean constraints on the request payloads.

<!-- MANUAL: -->
