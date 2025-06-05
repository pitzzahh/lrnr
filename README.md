# LRNR - Learning Management System API

A REST API for a learning management system built with Hono, Bun, and PostgreSQL.

## Features

- RESTful API with OpenAPI 3.0 specification
- Session-based authentication with HTTP-only cookies
- Role-based access control (Admin, Teacher, Student)
- User, course, category, and enrollment management
- Request/response validation with Zod schemas
- PostgreSQL database with Drizzle ORM
- Interactive API documentation with Scalar
- TypeScript for type safety
- Code quality tools (Biome for linting and formatting)

## Technology Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with HTTP-only cookies
- **Authorization**: Role-based access control
- **Validation**: Zod schemas
- **Documentation**: OpenAPI 3.0 with Scalar UI
- **Code Quality**: Biome (linting and formatting)
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

3. Set up your environment variables:
```bash
# Create .env file with your configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=lrnr
SESSION_SECRET=your-session-secret
PORT=3000
NODE_ENV=development
```

4. Run database migrations:
```bash
bun run db:migrate
```

5. Start the development server:
```bash
bun run dev
```

The API will be available at `http://localhost:3000` with interactive documentation at `http://localhost:3000/reference`.

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

### Environment Configuration

The application requires the following environment variables:

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
SESSION_SECRET=your-session-secret
```

### Project Structure

```
src/
├── app.ts              # Application setup and route registration
├── index.ts            # Server entry point
├── env.ts              # Environment variable validation
├── db/
│   ├── index.ts        # Database connection setup
│   ├── schema/         # Database schema definitions
│   │   ├── users.ts    # User schema with roles
│   │   ├── sessions.ts # Session management schema
│   │   ├── courses.ts  # Course schema
│   │   ├── categories.ts # Category schema
│   │   ├── enrollments.ts # Enrollment schema
│   │   └── enums/      # Database enums (roles, status)
│   └── migrations/     # Database migration files
├── hooks/
│   ├── auth.ts         # Authentication middleware
│   └── pino-logger.ts  # Request logging middleware
├── lib/
│   ├── create-app.ts   # Hono app factory
│   ├── configure-openapi.ts  # OpenAPI configuration
│   ├── constants.ts    # Application constants
│   ├── types.ts        # TypeScript type definitions
│   └── auth/           # Authentication utilities
│       └── index.ts    # Session management and password hashing
└── routes/
    ├── index.route.ts  # Root API route
    ├── auth/           # Authentication endpoints
    ├── users/          # User management endpoints
    ├── courses/        # Course management endpoints
    ├── categories/     # Category management endpoints
    ├── enrollments/    # Enrollment management endpoints
    └── llms/           # LLM integration endpoints
```

## Authentication

The API uses session-based authentication with HTTP-only cookies. Users have different roles that control access to various endpoints.

### User Roles

- **STUDENT**: Default role for new users
- **TEACHER**: Can manage courses and view enrollments
- **ADMIN**: Full access to all system resources

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

- Sessions are valid for 15 days by default
- Sessions are automatically refreshed on API usage  
- HTTP-only cookies are used for security
- Session data is stored in the database

### Usage Examples

**Register a new user:**
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

**Sign in:**
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Access protected endpoints:**
```bash
curl -X GET http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

## Security

The application implements standard security practices:

- Password hashing for user credentials
- HTTP-only cookies to prevent XSS attacks
- Input validation using Zod schemas
- Role-based access control for endpoints
- Parameterized database queries
- Environment variables for sensitive configuration

## API Documentation

Interactive API documentation is available at:
- `/doc` - OpenAPI JSON specification
- `/reference` - Scalar UI for testing endpoints

The documentation includes request/response schemas, authentication requirements, and example requests.

## Troubleshooting

### Common Issues

**Database Connection Problems:**
- Verify PostgreSQL is running
- Check database credentials in environment variables
- Ensure database exists and is accessible

**Authentication Issues:**
- Check that cookies are being sent with requests
- Verify session hasn't expired
- Ensure proper authentication headers

### Development Notes

- Use `bun run db:studio` to inspect database contents
- Check server logs for detailed error information
- Visit `/reference` for interactive API testing

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
