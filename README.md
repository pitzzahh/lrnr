# LRNR - Learning Management System API

A Learning Management System API built with Hono, Bun, and PostgreSQL. Features OpenAPI documentation, type-safe validation, and a clean architecture for educational platforms.

## Features

- RESTful API with OpenAPI 3.0 specification
- **Session-based authentication** with secure cookie management
- **Role-based access control** (Admin, Teacher, Student)
- **User management** with password hashing and validation
- Type-safe request/response validation with Zod
- PostgreSQL database with Drizzle ORM
- Automatic API documentation with Scalar
- Hot reload development server
- Code formatting and linting with Biome

## Technology Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookies
- **Authorization**: Role-based access control (RBAC)
- **Validation**: Zod
- **Documentation**: OpenAPI 3.0 with Scalar
- **Code Quality**: Biome
- **Language**: TypeScript

## Installation

### Prerequisites

- [Bun](https://bun.sh/) runtime
- PostgreSQL database

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd lrnr
```

2. Install dependencies:
```bash
bun install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:
```bash
bun run db:migrate
```

5. (Optional) Seed the database with initial data:
```bash
bun run db:seed
```

6. Start the development server:
```bash
bun run dev
```

The API will be available at `http://localhost:3000` and interactive documentation at `http://localhost:3000/reference`.

**First Steps:**
1. Visit `http://localhost:3000/reference` to explore the API documentation
2. Create your first admin user via `POST /auth/signup`
3. Sign in to access protected endpoints
4. Use the interactive documentation to test authenticated requests

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run lint` | Check code with Biome |
| `bun run lint:fix` | Fix linting issues |
| `bun run format` | Check code formatting |
| `bun run format:fix` | Format code |
| `bun run check` | Run code quality checks |
| `bun run db:generate` | Generate database migrations |
| `bun run db:migrate` | Apply database migrations |
| `bun run db:push` | Push schema changes to database |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:seed` | Seed database with initial data |

### Environment Configuration

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=lrnr

# Authentication Configuration
SESSION_SECRET=your-super-secret-session-key-here
```

### Project Structure

```
src/
├── app.ts              # Application setup and route registration
├── index.ts            # Server entry point
├── env.ts              # Environment variable validation
├── db/
│   ├── index.ts        # Database connection
│   ├── schema/         # Database schema definitions
│   │   ├── users.ts    # User schema with roles
│   │   ├── sessions.ts # Session management schema
│   │   └── enums/      # Database enums (roles, etc.)
│   └── migrations/     # Database migration files
├── hooks/
│   ├── auth.ts         # Authentication middleware
│   └── pino-logger.ts  # Request logging
├── lib/
│   ├── create-app.ts   # Hono app factory
│   ├── configure-openapi.ts  # OpenAPI configuration
│   ├── types.ts        # Shared type definitions
│   └── auth/           # Authentication utilities
│       └── index.ts    # Session management, password hashing
└── routes/
    ├── auth/           # Authentication endpoints
    │   ├── auth.routes.ts    # Login, signup, logout routes
    │   └── auth.index.ts     # Auth route registration
    ├── users/          # User management endpoints
    ├── courses/        # Course management endpoints
    ├── categories/     # Category management endpoints
    └── llms/           # LLM integration endpoints
```

## Authentication

The API uses **session-based authentication** with secure HTTP-only cookies. Users are assigned roles that determine their access permissions.

### User Roles

- **STUDENT**: Default role, can view courses and enroll
- **TEACHER**: Can create and manage courses, view enrolled students
- **ADMIN**: Full system access, user management capabilities

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|---------|-------------|
| `POST /auth/signup` | POST | Register a new user account |
| `POST /auth/signin` | POST | Sign in with email and password |
| `POST /auth/logout` | POST | Sign out and invalidate session |

### Protected Routes

Most API endpoints require authentication. The following routes are public:
- `GET /` - API root/health check
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User authentication
- `GET /doc` - OpenAPI specification
- `GET /reference` - API documentation

### Session Management

- Sessions are valid for **15 days** by default
- Sessions are automatically refreshed on API usage
- Secure cookies are used in production with `HttpOnly` and `Secure` flags
- Sessions are stored in the database for security and scalability

### Usage Examples

**User Registration:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "password_confirmation": "securepassword123"
  }'
```

**User Sign In:**
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Accessing Protected Routes:**
```bash
# Use the session cookie from sign in
curl -X GET http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

## Security

The application implements several security best practices:

- **Password Hashing**: Uses industry-standard hashing algorithms
- **Session Security**: HttpOnly cookies prevent XSS attacks
- **Input Validation**: All inputs validated with Zod schemas
- **Role-Based Access**: Fine-grained permissions by user role
- **Database Security**: Parameterized queries prevent SQL injection
- **Environment Isolation**: Sensitive data stored in environment variables

## API Documentation

The API documentation is automatically generated from route definitions and available at:
- `/doc` - OpenAPI JSON specification
- `/reference` - Interactive Scalar UI documentation 
- `/llms.md` - Markdown documentation for LLMs

The interactive documentation at `/reference` includes:

- Interactive API explorer with authentication support
- Request/response schemas with role-based access indicators
- Authentication requirements for each endpoint
- Example requests and responses
- User role and permission documentation

## Troubleshooting

### Common Authentication Issues

**Session Cookie Not Being Set:**
- Ensure `NODE_ENV` is properly configured in your `.env` file
- Check that your client supports cookies (use `-c cookies.txt` with curl)
- Verify the session cookie domain matches your request origin

**403 Unauthorized Errors:**
- Confirm you're signed in and have a valid session
- Check that your user role has permission for the requested endpoint
- Verify the session hasn't expired (30-day default)

**Database Connection Issues:**
- Ensure PostgreSQL is running and accessible
- Verify database credentials in your `.env` file
- Run `bun run db:migrate` to ensure schema is up to date

### Development Tips

- Use `bun run db:studio` to visually inspect your database
- Check the browser's developer tools for session cookies
- Monitor server logs for authentication middleware activity
- Use the `/reference` endpoint to test authentication interactively

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make your changes
4. Run tests and linting (`bun run check`)
5. Commit your changes (`git commit -m 'Add new feature'`)
6. Push to the branch (`git push origin feature/new-feature`)
7. Create a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
