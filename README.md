# Job Portal MCP Server

A Model Context Protocol (MCP) server for managing job postings and candidate profiles with intelligent matching capabilities.

## Features

- **Candidate Management**: Create, delete, and list candidate profiles
- **Job Management**: Create, delete, and list job postings
- **Intelligent Matching**: 
  - Find matching jobs for candidate profiles
  - Find matching candidates for job postings
- **Dual Transport Support**: HTTP and Stdio transports for maximum flexibility
- **Type-Safe**: Full TypeScript implementation with Zod validation

## Installation

```bash
npm install
```

## Quick Start

### Development Mode

**Stdio Mode** (default - for MCP clients like Claude Desktop):
```bash
npm run dev
```

**HTTP Server** (for testing with curl/Postman):
```bash
npm run dev:http
# Server runs on http://localhost:3000/mcp
```

### Production Mode

**Build the project:**
```bash
npm run build
```

**Run Stdio server** (default):
```bash
npm start
# or
job-portal
```

**Run HTTP server** (explicit):
```bash
npm run start:http
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "job-portal": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-job-portal/dist/stdio.js"]
    }
  }
}
```

Or if installed globally/locally:

```json
{
  "mcpServers": {
    "job-portal": {
      "command": "job-portal"
    }
  }
}
```

## Available Tools

### Candidate Tools
- **`create_profile`**: Register a new candidate profile
- **`delete_profile`**: Remove a candidate profile by ID
- **`match_jobs_for_profile`**: Find matching job opportunities for a candidate

### Job Provider Tools
- **`create_job`**: Post a new job opportunity
- **`delete_job`**: Remove a job posting by ID
- **`match_profiles_for_job`**: Find matching candidates for a job

## Available Resources

- **`list://profiles`**: View all candidate profiles
- **`list://jobs`**: View all job postings

## Example Usage

### Create a Candidate Profile
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": [
    {
      "company": "Tech Corp",
      "role": "Software Developer",
      "duration": "2 years"
    }
  ],
  "location": "Remote"
}
```

### Create a Job Posting
```json
{
  "title": "Senior Backend Developer",
  "company": "Innovative Tech",
  "location": "Remote",
  "description": "We're looking for an experienced backend developer...",
  "skillsRequired": ["Node.js", "PostgreSQL", "Docker"],
  "experienceRequired": "3+ years",
  "salary": 120000
}
```

### Match Jobs for a Profile
```json
{
  "profileId": 1
}
```

## Architecture

This project follows a modular architecture with clear separation of concerns. See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

### Key Modules
- **Transport Layer**: HTTP (`index.ts`) and Stdio (`stdio.ts`) entry points
- **Server Layer**: MCP server configuration (`server.ts`)
- **Business Logic**: Pure handler functions (`handlers.ts`)
- **Tool Definitions**: Declarative tool configuration (`tools.ts`)
- **Resource Definitions**: Resource configuration (`resources.ts`)
- **Data Layer**: In-memory storage (`database.ts`)
- **Type Safety**: Schemas and types (`types.ts`)

## Development

### Adding New Tools

1. Define schema in `src/types.ts`
2. Add business logic in `src/handlers.ts`
3. Create tool definition in `src/tools.ts`
4. Add to `allTools` array

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed instructions.

### Project Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run Stdio server in development mode (default)
- `npm run dev:http` - Run HTTP server in development mode
- `npm start` - Build and run Stdio server (default)
- `npm run start:http` - Build and run HTTP server
- `npx @modelcontextprotocol/inspector node dist/stdio.js` - Test via inspector

## API Response Format

All tool responses follow this format:

```typescript
{
  "success": boolean,
  "data": any | null,
  "error": {
    "code": string,
    "message": string,
    "details"?: any
  } | null
}
```

## Technologies

- **TypeScript** - Type-safe development
- **Zod** - Schema validation
- **Express** - HTTP server
- **MCP SDK** - Model Context Protocol implementation

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please open an issue on the GitHub repository.
