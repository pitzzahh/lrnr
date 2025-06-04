# LRNR - Learning Management System API

A Learning Management System API built with Hono, Bun, and PostgreSQL. Features OpenAPI documentation, type-safe validation, and a clean architecture for educational platforms.

## Features

- RESTful API with OpenAPI 3.0 specification
- Type-safe request/response validation with Zod
- PostgreSQL database with Drizzle ORM
- Automatic API documentation with Scalar
- Hot reload development server
- Code formatting and linting with Biome

## Technology Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL with Drizzle ORM
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

5. Start the development server:
```bash
bun run dev
```

The API will be available at `http://localhost:3000` and interactive documentation at `http://localhost:3000/reference`.

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

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=lrnr
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
│   └── migrations/     # Database migration files
├── lib/
│   ├── create-app.ts   # Hono app factory
│   ├── configure-openapi.ts  # OpenAPI configuration
│   └── types.ts        # Shared type definitions
└── routes/
    ├── users/          # User management endpoints
    ├── courses/        # Course management endpoints
    ├── categories/     # Category management endpoints
    └── llms/           # LLM integration endpoints
```

## API Documentation

The API documentation is automatically generated from route definitions and available at:
- `/doc` - OpenAPI JSON specification
- `/reference` - Interactive Scalar UI documentation 
- `/llms.md` - Markdown documentation for LLMs

The interactive documentation at `/reference` includes:

- Interactive API explorer
- Request/response schemas
- Authentication requirements
- Example requests and responses

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
