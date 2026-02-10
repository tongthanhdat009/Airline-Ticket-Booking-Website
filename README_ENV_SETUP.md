# Environment Variable Setup Guide

This guide explains how to configure environment variables for the Airline Ticket Booking application.

## Quick Start

1. **Copy the example file to create your local environment configuration:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your actual values:**
   ```bash
   # On Linux/Mac
   nano .env

   # On Windows
   notepad .env
   ```

3. **Never commit `.env` to version control!** It is already excluded in `.gitignore`.

---

## Required Environment Variables

### Database Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | MySQL database connection URL | `jdbc:mysql://localhost:3306/datvemaybay?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `your_secure_password` |

### JWT Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | (See [Generating Secure Secrets](#generating-secure-secrets) below) |
| `JWT_ACCESS_EXPIRATION` | Access token expiration (ms) | `2592000000` (30 days) |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration (ms) | `2592000000` (30 days) |

### AirportDB API

| Variable | Description | How to Obtain |
|----------|-------------|---------------|
| `AIRPORTDB_API_KEY` | API key for AirportDB service | Register at [AirportDB](https://airportdb.io/) |

### OpenRouter API (AI Features)

| Variable | Description | How to Obtain |
|----------|-------------|---------------|
| `OPENROUTER_API_KEY` | OpenRouter API key | Get from [OpenRouter Keys](https://openrouter.ai/keys) |
| `OPENROUTER_BASE_URL` | OpenRouter API base URL | `https://openrouter.ai/api` |
| `OPENROUTER_MODEL` | AI model to use | `tngtech/tng-r1t-chimera:free` |
| `OPENROUTER_TEMPERATURE` | Model temperature | `0.7` |
| `OPENROUTER_MAX_TOKENS` | Maximum tokens per request | `4096` |

### Google OAuth2

| Variable | Description | How to Obtain |
|----------|-------------|---------------|
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_OAUTH_REDIRECT_URI` | OAuth redirect URI | `http://localhost:8080/login/oauth2/code/google` |
| `GOOGLE_OAUTH_SCOPE` | OAuth scopes | `openid, profile, email` |

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Create "OAuth 2.0 Client IDs"
5. Add authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`

### Email Configuration (Gmail)

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USERNAME` | Email address | `your_email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password | (See setup below) |

**Setup Steps for Gmail:**
1. Enable 2-Step Verification on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new App Password for "Mail"
4. Use the generated 16-character password as `EMAIL_PASSWORD`

### VNPay Payment Configuration

| Variable | Description | How to Obtain |
|----------|-------------|---------------|
| `VNPAY_TMN_CODE` | VNPay Terminal Code | [VNPay Sandbox](https://sandbox.vnpayment.vn/) |
| `VNPAY_SECRET_KEY` | VNPay Secret Key | [VNPay Sandbox](https://sandbox.vnpayment.vn/) |
| `VNPAY_PAY_URL` | Payment URL | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `VNPAY_API_URL` | API URL | `https://sandbox.vnpayment.vn/merchant_webapi/api/transaction` |
| `VNPAY_RETURN_URL` | Backend callback URL | `http://localhost:8080/api/vnpay/payment-callback` |
| `VNPAY_FRONTEND_URL` | Frontend callback URL | `http://localhost:5173/vnpay-callback` |

**Setup Steps:**
1. Register at [VNPay Sandbox](https://sandbox.vnpayment.vn/)
2. Get your TMN Code and Secret Key from the merchant portal
3. Configure the return URLs in your VNPay dashboard

---

## Generating Secure Secrets

### JWT_SECRET

The JWT secret should be a strong, random string. Here are several ways to generate one:

**Using OpenSSL (Linux/Mac/Git Bash):**
```bash
openssl rand -base64 64
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Using Python:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Using PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Important:** The JWT secret should be at least 256 bits (32 characters) for HS256 algorithm.

### Other Sensitive Values

For other sensitive values like API keys and passwords:
- Use a password manager (e.g., 1Password, Bitwarden, LastPass)
- Generate passwords with at least 16 characters
- Include a mix of uppercase, lowercase, numbers, and symbols
- Never reuse passwords across services

---

## Environment-Specific Configuration

### Development

For local development, you can use:
- Default database credentials (not recommended for production)
- Sandbox/test API keys
- Localhost redirect URLs

### Production

For production deployment:
1. Use strong, unique passwords for all services
2. Use production API keys (not sandbox)
3. Update redirect URLs to production domains
4. Enable SSL/TLS for all connections
5. Use environment variables provided by your hosting platform (e.g., Docker, Kubernetes, AWS, etc.)

---

## Troubleshooting

### Application Won't Start

1. **Check if `.env` file exists:**
   ```bash
   ls -la .env
   ```

2. **Verify all required variables are set:**
   ```bash
   grep -v '^#' .env | grep -v '^$'
   ```

3. **Check for syntax errors:**
   - No spaces around `=`
   - Values with spaces should be quoted
   - No trailing whitespace

### Database Connection Failed

1. Verify MySQL is running
2. Check `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`
3. Ensure database `datvemaybay` exists:
   ```sql
   CREATE DATABASE IF NOT EXISTS datvemaybay;
   ```

### OAuth2 Not Working

1. Verify credentials in Google Cloud Console
2. Check that redirect URI matches exactly
3. Ensure OAuth consent screen is configured

### Email Not Sending

1. Verify Gmail App Password is correct
2. Check 2-Step Verification is enabled
3. Ensure `EMAIL_HOST` and `EMAIL_PORT` are correct

---

## Security Best Practices

1. **Never commit `.env` to version control**
2. **Use different credentials for each environment**
3. **Rotate secrets periodically**
4. **Limit API key permissions to minimum required**
5. **Use environment-specific OAuth applications**
6. **Enable audit logging where available**
7. **Use a secrets manager in production** (AWS Secrets Manager, HashiCorp Vault, etc.)

---

## File Structure

```
project-root/
├── .env                 # Local environment variables (gitignored)
├── .env.example         # Template with placeholder values
├── README_ENV_SETUP.md  # This file
└── J2EE-Backend/
    └── src/main/resources/
        └── application.properties  # Uses ${ENV_VAR:default} syntax
```

---

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your configuration against `.env.example`
3. Check application logs for specific error messages
4. Ensure all external services (database, APIs) are accessible
