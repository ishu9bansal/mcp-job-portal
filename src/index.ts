import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
    CreateProfileSchema, CreateJobSchema,
    type CreateProfileInput, type CreateJobInput,
    makeSuccess, makeError,
    MatchOptionsSchema, type MatchOptions,
    ToolResponse,
    MatchJobsForProfileSchema, MatchProfilesForJobSchema
} from "./types.js";
import express from "express";


// Create server instance
const server = new McpServer({
    name: "job-portal-server",
    version: "1.0.0"
});

// Simulated database
const profiles: (CreateProfileInput & { id: number })[] = [];
const jobs: (CreateJobInput & { id: number })[] = [];

// helper for next id
function nextId(arr: { id?: number }[]) {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map(x => x.id ?? 0)) + 1;
}

// Simulated function to create a profile
async function simulateCreateProfile(profile: CreateProfileInput): Promise<ToolResponse> {
    try {
        const newProfile = { id: nextId(profiles), ...profile };
        profiles.push(newProfile);
        return makeSuccess(newProfile);
    } catch (error) {
        return makeError("DATABASE_ERROR", "Failed to create profile", String(error));
    }
}

async function simulateCreateJob(job: CreateJobInput): Promise<ToolResponse> {
    try {
        const newJob = { id: nextId(jobs), ...job };
        jobs.push(newJob);
        return makeSuccess(newJob);
    } catch (error) {
        return makeError("DATABASE_ERROR", "Failed to create job posting", String(error));
    }
}

// Register createProfile tool
server.tool(
    "create_profile",
    "Create a user profile with personal details, skills, and experience.",
    CreateProfileSchema,
    async (params: CreateProfileInput, context) => {
        const results = await simulateCreateProfile(params);

        if (!results.success)
            return makeError("CREATE_PROFILE_FAILED", "Failed to create profile");

        return results;
    },
);

// Register createJob tool
server.tool(
    "create_job",
    "Create a job posting with title, company, location, experience, salary, description, and required skills.",
    CreateJobSchema,
    async (params: CreateJobInput, context) => {
        const results = await simulateCreateJob(params);

        if (!results.success)
            return makeError("CREATE_JOB_FAILED", "Failed to create job posting");

        return results;
    },
);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Job Portal MCP Server is running on http://localhost:${PORT}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});