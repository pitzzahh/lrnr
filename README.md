# 🎓 LRNR - Learning Management System API

A modern Learning Management System API built with [Hono](https://hono.dev/), [Bun](https://bun.sh/), and OpenAPI documentation. Fast, type-safe, and developer-friendly.

## ✨ Features

- 🚀 **Fast Runtime**: Built on Bun for lightning-fast performance
- 📚 **OpenAPI Documentation**: Auto-generated API docs with Scalar
- 🔒 **Type Safety**: Full TypeScript support with Zod validation
- 🎯 **Modern Stack**: Hono framework for lightweight and efficient routing
- 🧹 **Code Quality**: Biome for linting and formatting
- 🔥 **Hot Reload**: Development server with automatic reloading

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Hono](https://hono.dev/)
- **OpenAPI**: [@hono/zod-openapi](https://github.com/honojs/hono/tree/main/packages/zod-openapi)
- **Validation**: [Zod](https://zod.dev/)
- **Linting/Formatting**: [Biome](https://biomejs.dev/)
- **Language**: TypeScript

## 🚀 Quick Start

### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed on your system:

```sh
curl -fsSL https://bun.sh/install | bash
```

### Installation

1. Clone the repository:
```sh
git clone <your-repo-url>
cd lrnr
```

2. Install dependencies:
```sh
bun install
```

3. Start the development server:
```sh
bun run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run lint` | Check code with Biome linter |
| `bun run lint:fix` | Fix linting issues automatically |
| `bun run format` | Check code formatting |
| `bun run format:fix` | Format code automatically |
| `bun run check` | Run comprehensive code check |

## 📁 Project Structure

```
lrnr/
├── src/
│   └── index.ts          # Main application entry point
├── biome.json            # Biome configuration
├── bun.lock              # Bun lockfile
├── package.json          # Project dependencies and scripts
├── README.md             # Project documentation
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
# Add other environment variables as needed
```

### TypeScript Configuration

The project uses strict TypeScript settings with:
- Strict mode enabled
- JSX support with Hono JSX
- Path mapping for clean imports (`@/*` → `./src/*`)

### Code Quality

Biome is configured for:
- ESLint-style linting with recommended rules
- Prettier-style formatting with tabs and 100 character line width
- Import organization
- Git integration

## 📖 API Documentation

Once the server is running, access the auto-generated OpenAPI documentation with Scalar at:

```
http://localhost:3000/doc
```

The API documentation is automatically generated from your route definitions using Zod schemas and beautifully rendered with Scalar's modern interface.

## 🏗️ Development

### Adding New Routes

Example of adding a new route with OpenAPI documentation:

```typescript
import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/users',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
          })),
        },
      },
      description: 'List of users',
    },
  },
});

app.openapi(route, (c) => {
  // Your route handler
  return c.json([]);
});
```

### Code Style

This project uses Biome for consistent code formatting and linting. Run the following before committing:

```sh
bun run lint:fix
bun run format:fix
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Hono](https://hono.dev/) - The fast, lightweight web framework
- [Bun](https://bun.sh/) - The all-in-one JavaScript runtime
- [Biome](https://biomejs.dev/) - Fast formatter and linter
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [stoker](https://github.com/w3cj/stoker) - For utilities for hono and @hono/zod-openapi

---

Built with ❤️ and modern web technologies
