import express from 'express';
import { createMcpServer } from "./server.js";
import { mcpAuthMiddleware, registerWellKnownHandlers, useAuthMiddleware } from './auth.js';
import { streamableHttpHandler } from '@clerk/mcp-tools/express';

/**
 * Main entry point for the Job Portal MCP Server
 * Sets up Express HTTP server and connects it to the MCP server
 */

// Create MCP server instance
const server = createMcpServer();

// Set up Express and HTTP transport
const app = express();
useAuthMiddleware(app);
app.use(express.json());


app.get('/', (_req, res) => {
    res.send('Job Portal MCP Server is running. Use the /mcp endpoint for MCP interactions.');
});
app.post('/mcp', mcpAuthMiddleware, streamableHttpHandler(server)); // TODO: keep auth middleware optional/configurable, invert clerk dependency
registerWellKnownHandlers(app);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(PORT, () => {
    console.log(`Job Portal MCP Server is running on http://localhost:${PORT}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});