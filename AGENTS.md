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
- **Build Tool**: Maven
- **Database**: MySQL with Flyway migrations
- **ORM**: Spring Data JPA (Hibernate)
- **Security**: Spring Security, JWT (JJWT 0.11.5), OAuth2 (Google Login)
- **WebSocket**: STOMP for real-time features
- **AI Integration**: Spring AI with OpenRouter
- **Reports**: JasperReports for PDF generation
- **Payment**: VNPay integration
- **Email**: Spring Mail (Gmail SMTP)

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

---

## Project Structure

```
Airline-Ticket-Booking-Website/
├── J2EE-Backend/              # Spring Boot backend
│   ├── src/main/java/com/example/j2ee/
│   │   ├── annotation/        # Custom annotations (@RequirePermission, @RequireRole)
│   │   ├── aspect/            # AOP aspects (PermissionAspect)
│   │   ├── config/            # Configuration classes (Security, WebSocket, OAuth2, VNPay)
│   │   ├── controller/        # REST API controllers
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── exception/         # Global exception handler
│   │   ├── jwt/               # JWT filter and utilities
│   │   ├── model/             # JPA entity classes
│   │   ├── repository/        # Spring Data repositories
│   │   ├── security/          # Security components
│   │   ├── service/           # Business logic services
│   │   ├── util/              # Utility classes
│   │   └── validation/        # Custom validators
│   └── src/main/resources/
│       ├── db/migration/      # Flyway migrations (V1__Initial_Schema.sql, V2__Initial_Data.sql)
│       ├── jasper/            # JasperReports templates
│       └── application.properties
├── J2EE-Frontend/             # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Admin/         # Admin-specific components
│   │   │   ├── common/        # Shared components (Navbar, ProtectedRoute)
│   │   │   ├── KhachHang/     # Customer components
│   │   │   ├── QuanLy/        # Admin management components
│   │   │   └── TaiKhoan/      # Account components
│   │   ├── constants/         # Configuration constants (aircraftConfig.js)
│   │   ├── data/              # Static data (adminMenuData.js)
│   │   ├── hooks/             # Custom React hooks (useAuth, usePermission, useToast, useWebSocket)
│   │   ├── i18n/              # Internationalization
│   │   │   └── locales/       # en/en.json, vi/vi.json
│   │   ├── pages/             # Page components
│   │   │   ├── KhachHang/     # Customer pages
│   │   │   ├── QuanLy/        # Admin pages
│   │   │   └── OAuth2Callback.jsx
│   │   ├── services/          # API service functions
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
└── plan/                      # Planning documents (markdown files)
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
```

**Prerequisites**:
- MySQL database `datvemaybay` must exist
- Database credentials: root/12345 (as configured in application.properties)
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

4. **API Response Pattern**:
   - All responses wrapped in `ApiResponse<T>`:
     ```json
     {
       "success": true,
       "message": "...",
       "data": { ... }
     }
     ```

### Frontend
1. **Authentication Flow**:
   - Access tokens stored in cookies
   - Refresh tokens stored in memory (lost on page refresh)
   - Automatic token refresh via Axios interceptors
   - Separate auth flows for admin and customer

2. **API Client** (`apiClient.jsx`):
   - Centralized Axios instance with interceptors
   - Automatic token attachment and refresh
   - User type detection (admin vs customer)

3. **Route Protection**:
   - `ProtectedRoute` and `AdminProtectedRoute` components
   - `RequireCompleteProfile` for profile completion check

4. **Permission System**:
   - Frontend-based permission checking via `usePermission` hook
   - Permissions: VIEW, CREATE, UPDATE, DELETE per feature

---

## Key Configuration Files

### Backend
- `J2EE-Backend/pom.xml` - Maven dependencies
- `J2EE-Backend/src/main/resources/application.properties` - App configuration
  - Database connection (MySQL)
  - JWT settings
  - Flyway migrations
  - VNPay payment config
  - OAuth2 Google credentials
  - Email (Gmail) settings
  - OpenRouter AI config

### Frontend
- `J2EE-Frontend/package.json` - NPM dependencies
- `J2EE-Frontend/vite.config.js` - Vite configuration
- `J2EE-Frontend/tailwind.config.js` - Tailwind CSS theme (SGU Airline colors)
- `J2EE-Frontend/eslint.config.js` - ESLint rules

---

## Database Schema

Key tables (see `V1__Initial_Schema.sql` for full schema):
- `sanbay` - Airports
- `tuyenbay` - Flight routes
- `chitietchuyenbay` - Flight details
- `maybay` - Aircraft
- `chitietghe` - Seat details
- `hangve` - Ticket classes
- `hanhkhach` - Passengers
- `taikhoan` / `taikhoanadmin` - User accounts
- `donhang` - Orders (with PNR code)
- `datcho` - Bookings
- `dichvucungcap` - Services
- `khuyenmai` - Promotions
- `vaitro` / `phanquyen` - Roles and permissions

---

## Testing

### Backend Tests
- **Framework**: JUnit 5 with Mockito
- **Test Files**: Located in `src/test/java/`
- **Example**: `DonHangServiceTest.java` - Unit tests for order service

### Manual Testing
- API verification reports in `.auto-claude/specs/`
- Manual test plans for feature verification

---

## Code Style Guidelines

### Java (Backend)
- Constructor injection preferred over field `@Autowired`
- Use Lombok annotations (`@Getter`, `@Setter`, `@NoArgsConstructor`, etc.)
- Vietnamese error messages for user-facing errors
- Comprehensive JavaDoc for controllers
- `@Transactional` on state-changing service methods
- Soft delete via `@SQLDelete` and `@SQLRestriction`

### JavaScript/React (Frontend)
- Functional components with hooks
- JSX file extension
- Vietnamese comments in code
- Custom hooks for reusable logic (`useAuth`, `usePermission`, etc.)
- Services organized by feature (e.g., `QLDonHangService.jsx`)

---

## Security Considerations

1. **Authentication**:
   - JWT tokens with expiration
   - Refresh token rotation
   - OAuth2 for Google login

2. **Authorization**:
   - Role-based access control
   - Dynamic permission checking
   - API endpoints protected by Spring Security

3. **Data Protection**:
   - Soft delete for data retention
   - Input validation with Jakarta Validation
   - HTTPS recommended for production

4. **Sensitive Data**:
   - API keys and secrets in `application.properties` (should be externalized in production)
   - Email passwords, VNPay credentials, OAuth2 secrets

---

## External Integrations

1. **VNPay**: Payment gateway for ticket purchases
2. **Google OAuth2**: Social login for customers
3. **OpenRouter**: AI chatbot integration
4. **AirportDB**: Airport data API
5. **Gmail SMTP**: Email notifications

---

## Development Workflow

1. **Database Changes**: Use Flyway migrations in `src/main/resources/db/migration/`
2. **API Development**: Follow Controller → Service → Repository pattern
3. **Frontend Development**: Add pages in `src/pages/`, components in `src/components/`
4. **API Integration**: Add service functions in `src/services/`
5. **Testing**: Write unit tests for services, manual test for controllers

---

## Deployment Notes

- Backend runs on port 8080
- Frontend dev server runs on port 5173
- Frontend production build in `dist/` folder
- CORS configured for local development
- Database must be initialized with Flyway migrations

---

## Common Issues

1. **Database Connection**: Ensure MySQL is running and database `datvemaybay` exists
2. **CORS Errors**: Backend and frontend must use correct ports
3. **Token Expiration**: Refresh tokens are lost on page reload (by design)
4. **Migration Failures**: Check Flyway history table if migrations fail

---

## Contact & Support

For more information about features and implementation details, refer to:
- Verification reports in `.auto-claude/specs/`
- Planning documents in `plan/` directory
- API documentation in controller JavaDoc comments
