import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { createMcpServer } from "./server.js";
import { mcpAuthMiddleware, registerWellKnownHandlers, useAuthMiddleware } from './auth.js';

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
app.post('/mcp', mcpAuthMiddleware, async (req, res) => {
    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});
registerWellKnownHandlers(app);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Job Portal MCP Server is running on http://localhost:${PORT}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});