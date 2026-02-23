# Airline Ticket Booking Website - Agent Documentation

## Project Overview

This is a full-stack Airline Ticket Booking System (Hệ thống đặt vé máy bay) with an admin dashboard and customer-facing website. The system supports flight search, booking, payment integration, check-in, and comprehensive admin management.

**Language**: Vietnamese (primary), English (i18n support)  
**Domain**: Airline Ticket Booking / Đặt vé máy bay

---

## Technology Stack

### Backend (J2EE-Backend)
- **Framework**: Spring Boot 3.5.5
- **Language**: Java 21
- **Build Tool**: Maven (wrapper: `./mvnw`)
- **Database**: MySQL with Flyway migrations
- **ORM**: Spring Data JPA (Hibernate)
- **Security**: Spring Security, JWT (JJWT 0.11.5), OAuth2 (Google Login)
- **WebSocket**: STOMP for real-time features
- **AI Integration**: Spring AI with OpenRouter
- **Reports**: JasperReports (4 templates: audit_log, invoice, revenue, ticket)
- **Payment**: VNPay integration
- **Email**: Spring Mail (Gmail SMTP)
- **Caching**: Spring Cache + Caffeine
- **Excel Export**: Apache POI

### Frontend (J2EE-Frontend)
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS 4.1.13
- **UI Components**: Ant Design 5.28.0
- **Icons**: Heroicons, React Icons, Ant Design Icons
- **State Management**: React hooks (no Redux)
- **HTTP Client**: Axios
- **Authentication**: JWT with cookie storage
- **i18n**: react-i18next (English/Vietnamese)
- **Charts**: Recharts
- **PDF Generation**: jsPDF, html2canvas
- **Excel**: xlsx
- **Package Manager**: pnpm 9

---

## Project Structure

```
Airline-Ticket-Booking-Website/
├── J2EE-Backend/              # Spring Boot backend
│   ├── src/main/java/com/example/j2ee/
│   │   ├── annotation/        # Custom annotations (@RequirePermission, @RequireRole, @Auditable)
│   │   ├── aspect/            # AOP aspects (PermissionAspect, AuditLogAspect)
│   │   ├── config/            # Configuration classes (Security, WebSocket, OAuth2, VNPay, Cache, Flyway)
│   │   ├── controller/        # REST API controllers (60+ controllers)
│   │   ├── dto/               # Data Transfer Objects (organized by feature)
│   │   ├── exception/         # Global exception handler
│   │   ├── jwt/               # JWT filter and utilities
│   │   ├── model/             # JPA entity classes (40+ entities)
│   │   ├── repository/        # Spring Data repositories
│   │   ├── scheduler/         # Scheduled tasks (PaymentExpiryScheduler)
│   │   ├── security/          # Security components (AdminRoleVoter, AdminUserDetails, DynamicAdminAuthorizationManager)
│   │   ├── service/           # Business logic services (50+ services)
│   │   ├── util/              # Utility classes (SecurityUtil, VNPayUtil)
│   │   └── validation/        # Custom validators
│   └── src/main/resources/
│       ├── db/migration/      # Flyway migrations (V1-V16 + test data)
│       ├── jasper/            # JasperReports templates (.jrxml)
│       └── application.properties
│   └── src/test/              # Unit tests (JUnit 5 + Mockito)
├── J2EE-Frontend/             # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Admin/         # Admin-specific components (Header, Sidebar, PermissionProtectedRoute)
│   │   │   ├── Auth/          # Auth components (AuthLayout, LoginForm, RegisterForm)
│   │   │   ├── common/        # Shared components (Navbar, ProtectedRoute, Toast, Chatbot)
│   │   │   ├── KhachHang/     # Customer components
│   │   │   └── QuanLy/        # Admin management components
│   │   ├── constants/         # Configuration constants
│   │   ├── data/              # Static data (adminMenuData.js)
│   │   ├── hooks/             # Custom React hooks (useAuth, usePermission, useToast, useWebSocket, etc.)
│   │   ├── i18n/              # Internationalization (en/vi)
│   │   ├── pages/             # Page components
│   │   │   ├── KhachHang/     # Customer pages (20+ pages)
│   │   │   └── QuanLy/        # Admin pages (25+ pages)
│   │   ├── services/          # API service functions (25+ service files)
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── .github/workflows/         # GitHub Actions CI/CD
│   ├── ci-backend.yml         # Backend CI (test + build)
│   ├── ci-frontend.yml        # Frontend CI (lint + build)
│   └── cd-production.yml      # Production CD
├── deploy/                    # Deployment scripts
│   └── deploy-production.sh   # Production deploy script
├── plan/                      # Planning documents
│   ├── api-driven-admin-menu-plan.md
│   ├── cicd-setup-plan.md
│   ├── guest-customer-system-plan.md
│   ├── payment-flow-refactor-plan.md
│   └── responsive-and-color-sync-plan.md
└── README_ENV_SETUP.md        # Environment setup guide
```

---

## Build and Run Commands

### Backend
```bash
cd J2EE-Backend

# Run the application (requires MySQL running on localhost:3306)
./mvnw spring-boot:run

# Build the project
./mvnw clean package

# Run tests
./mvnw test

# Build JAR for production
./mvnw package -DskipTests
```

**Prerequisites**:
- MySQL database `datvemaybay` must exist
- Java 21
- `.env` file with required environment variables
- Flyway migrations run automatically on startup

### Frontend
```bash
cd J2EE-Frontend

# Install dependencies (uses pnpm)
pnpm install

# Start development server (port 5173)
pnpm run dev

# Build for production
pnpm run build

# Run ESLint
pnpm run lint

# Preview production build
pnpm run preview
```

**Prerequisites**:
- Node.js 20+
- pnpm 9

---

## Environment Configuration

### Backend (.env file in project root)
```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/datvemaybay?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_at_least_32_chars

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# External APIs
AIRPORTDB_API_KEY=your_airportdb_key
OPENROUTER_API_KEY=your_openrouter_key

# OAuth2 Google
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret

# Email (Gmail)
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# VNPay (Sandbox)
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECRET_KEY=your_secret_key
VNPAY_RETURN_URL=http://localhost:8080/api/vnpay/payment-callback
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env file in J2EE-Frontend)
```properties
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_ENV=development
```

See `README_ENV_SETUP.md` for detailed environment setup instructions.

---

## Architecture Patterns

### Backend
1. **Layered Architecture**:
   - Controller → Service → Repository → Database
   - DTOs for API requests/responses
   - Models for JPA entities

2. **Security**:
   - JWT-based authentication with access/refresh tokens
   - Role-based access control (RBAC) with dynamic permissions
   - OAuth2 for Google login
   - Admin roles: SUPER_ADMIN, QUAN_LY, NHAN_VIEN_VE, KE_TOAN, VAN_HANH

3. **Soft Delete Pattern**:
   - All entities have `da_xoa` (is_deleted) and `deleted_at` fields
   - Uses `@SQLDelete` and `@SQLRestriction` annotations
   - Example: `@SQLDelete(sql = "UPDATE taikhoan SET da_xoa = 1, deleted_at = NOW() WHERE mataikhoan = ?")`

4. **API Response Pattern**:
   - All responses wrapped in `ApiResponse<T>`:
     ```json
     {
       "success": true,
       "message": "...",
       "data": { ... }
     }
     ```

5. **Audit Logging**:
   - `@Auditable` annotation for tracking changes
   - `AuditLogAspect` for automatic audit logging
   - Separate `audit_log` table with user, action, entity details

### Frontend
1. **Authentication Flow**:
   - Access tokens stored in cookies (js-cookie)
   - Refresh tokens stored in localStorage
   - Automatic token refresh via Axios interceptors
   - Separate auth flows for admin and customer

2. **API Client** (`apiClient.jsx`):
   - Centralized Axios instance with interceptors
   - Automatic token attachment and refresh
   - User type detection (admin vs customer)

3. **Route Protection**:
   - `ProtectedRoute`, `AdminProtectedRoute` components
   - `PermissionProtectedRoute` for RBAC
   - `RequireCompleteProfile` for profile completion check

4. **Permission System**:
   - Frontend-based permission checking via `usePermission` hook
   - Permissions: VIEW, CREATE, UPDATE, DELETE per feature
   - Menu-driven permission system from backend

---

## Database Schema

Key tables (see `V1__Initial_Schema.sql` for full schema):

| Table | Description |
|-------|-------------|
| `sanbay` | Airports (IATA/ICAO codes) |
| `tuyenbay` | Flight routes |
| `chitietchuyenbay` | Flight details (schedule, status) |
| `maybay` | Aircraft information |
| `chitietghe` | Seat details and layout |
| `hangve` | Ticket classes |
| `hanhkhach` | Passengers |
| `taikhoan` / `taikhoanadmin` | User accounts (customer/admin) |
| `donhang` | Orders (with PNR code) |
| `datcho` | Bookings |
| `dichvucungcap` | Services |
| `khuyenmai` | Promotions |
| `vaitro` / `phanquyen` | Roles and permissions |
| `audit_log` | Audit trail |
| `vnpay_transaction_log` | Payment transaction logs |

**Migration Strategy**: Flyway versioned migrations (V1__Initial_Schema.sql through V16__...)

---

## Testing

### Backend Tests
- **Framework**: JUnit 5 with Mockito
- **Test Files**: Located in `src/test/java/`
- **Example**: `DonHangServiceTest.java` - Unit tests for order service
- **H2 Database**: Used for testing (in-memory)
- **Run Tests**: `./mvnw test`

### Frontend Tests
- **Linting**: ESLint with React Hooks and React Refresh plugins
- **Run Linter**: `pnpm lint`
- No unit tests currently implemented (recommendation: add Jest + React Testing Library)

### Manual Testing
- API verification reports in `.auto-claude/specs/`
- Manual test plans for feature verification

---

## CI/CD Pipeline

### GitHub Actions Workflows

1. **CI Backend** (`.github/workflows/ci-backend.yml`):
   - Trigger: PR to `main`, push to `staging`
   - Java 21 setup with Maven caching
   - Run tests: `./mvnw test`
   - Build JAR artifact
   - Upload artifact (retention: 7 days)

2. **CI Frontend** (`.github/workflows/ci-frontend.yml`):
   - Trigger: PR to `main`, push to `staging`
   - Node.js 20 + pnpm 9
   - Install dependencies: `pnpm install --frozen-lockfile`
   - Run lint: `pnpm lint`
   - Build: `pnpm build`
   - Upload `dist` artifact

3. **CD Production** (`.github/workflows/cd-production.yml`):
   - SSH to VPS and run deploy script
   - Requires secrets: `SSH_PRIVATE_KEY`, `VPS_IP`, `VPS_USER`

### Branch Strategy
- `main`: Stable production branch
- `staging`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Emergency fixes

---

## Deployment

### Production Deployment
- **Backend**: Systemd service (`airline`)
- **Location**: `/opt/airline-prod/backend/app.jar`
- **Script**: `deploy/deploy-production.sh`
- **Web Server**: Nginx (reverse proxy + static files)

### Deploy Steps
1. Build JAR: `./mvnw package -DskipTests`
2. Copy JAR to server: `/opt/airline-prod/backend/app.jar`
3. Restart service: `sudo systemctl restart airline`
4. Reload Nginx: `sudo systemctl reload nginx`
5. Verify: `sudo systemctl is-active airline`

---

## Code Style Guidelines

### Java (Backend)
- **Constructor injection** preferred over field `@Autowired`
- Use **Lombok annotations** (`@Getter`, `@Setter`, `@NoArgsConstructor`, etc.)
- **Vietnamese error messages** for user-facing errors
- **Comprehensive JavaDoc** for controllers
- **`@Transactional`** on state-changing service methods
- **Soft delete** via `@SQLDelete` and `@SQLRestriction`
- **Package naming**: `com.example.j2ee.{layer}`

### JavaScript/React (Frontend)
- **Functional components** with hooks
- **JSX file extension**
- **Vietnamese comments** in code
- **Custom hooks** for reusable logic (`useAuth`, `usePermission`, etc.)
- **Services organized by feature** (e.g., `QLDonHangService.jsx`)
- **Named exports** preferred for components

---

## Security Considerations

1. **Authentication**:
   - JWT tokens with expiration (access: 5min, refresh: 30 days)
   - Refresh token rotation
   - OAuth2 for Google login

2. **Authorization**:
   - Role-based access control (RBAC)
   - Dynamic permission checking via database
   - API endpoints protected by Spring Security

3. **Data Protection**:
   - Soft delete for data retention
   - Input validation with Jakarta Validation
   - HTTPS recommended for production

4. **Sensitive Data**:
   - API keys and secrets in `.env` file (never commit)
   - Email passwords, VNPay credentials, OAuth2 secrets
   - JWT secret must be at least 256 bits

5. **CORS**:
   - Configured for specific origins
   - Credentials allowed for cookie-based auth

---

## External Integrations

1. **VNPay**: Payment gateway for ticket purchases (sandbox/production)
2. **Google OAuth2**: Social login for customers
3. **OpenRouter**: AI chatbot integration (Spring AI)
4. **AirportDB**: Airport data API
5. **Gmail SMTP**: Email notifications

---

## Common Issues & Troubleshooting

1. **Database Connection**: 
   - Ensure MySQL is running
   - Database `datvemaybay` must exist
   - Check credentials in `.env`

2. **CORS Errors**: 
   - Backend and frontend must use correct ports
   - Update `CORS_ALLOWED_ORIGINS` in backend `.env`

3. **Token Expiration**: 
   - Refresh tokens are lost on page reload (by design for customer)
   - Admin refresh tokens persist in localStorage

4. **Migration Failures**: 
   - Check Flyway history table if migrations fail
   - Never modify already-applied migrations

5. **Build Failures**:
   - Backend: Check Java 21 is installed
   - Frontend: Delete `node_modules` and `pnpm install` again

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `J2EE-Backend/pom.xml` | Maven dependencies and build config |
| `J2EE-Backend/src/main/resources/application.properties` | App configuration |
| `J2EE-Frontend/package.json` | NPM dependencies |
| `J2EE-Frontend/vite.config.js` | Vite configuration |
| `J2EE-Frontend/eslint.config.js` | ESLint rules |
| `.env` | Environment variables (gitignored) |
| `README_ENV_SETUP.md` | Detailed env setup guide |

---

## Development Workflow

1. **Database Changes**: Add Flyway migrations in `db/migration/`
2. **API Development**: Follow Controller → Service → Repository pattern
3. **Frontend Development**: Add pages in `pages/`, components in `components/`
4. **API Integration**: Add service functions in `services/`
5. **Testing**: Write unit tests for services, manual test for controllers
6. **i18n**: Add translations in `i18n/locales/{en,vi}/`

---

## Contact & Support

For more information about features and implementation details, refer to:
- Planning documents in `plan/` directory
- API documentation in controller JavaDoc comments
- GitHub workflow files in `.github/workflows/`
- Environment setup guide: `README_ENV_SETUP.md`
