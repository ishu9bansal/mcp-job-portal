import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';

import { type CreateProfileInput, CreateProfileSchema } from "./types.js";
import { type CreateJobInput, CreateJobSchema } from "./types.js";
import { type DeleteProfileInput, DeleteProfileSchema } from "./types.js";
import { type DeleteJobInput, DeleteJobSchema } from "./types.js";
import { type MatchJobsForProfileInput, MatchJobsForProfileSchema } from "./types.js";
import { type MatchProfilesForJobInput, MatchProfilesForJobSchema } from "./types.js";
import { makeSuccess, makeError } from "./types.js";
import { type ToolResponse, ToolResponseSchema } from "./types.js";

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

const wrapStructured = (results: ToolResponse) => ({
    content: [
        { type: "text", text: JSON.stringify(results) }
    ],
    structuredContent: results
});

const formatList = (uri, results) => ({
    contents: [
        {
            uri: String(uri),
            text: JSON.stringify({ items: results })
        }
    ],
    structuredContent: { items: results }
});

// Register createProfile tool
server.registerTool(
    "create_profile",
    {
        title: "Create Profile Tool",
        description: "Create a user profile with name, email, experience, skills, and desired job titles.",
        inputSchema: CreateProfileSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: CreateProfileInput, context) => {
        const results = await simulateCreateProfile(params);
        if (!results.success) {
            return wrapStructured(makeError("CREATE_PROFILE_FAILED", "Failed to create profile"));
        }
        return wrapStructured(results);
    }
);

// Register createJob tool
server.registerTool(
    "create_job",
    {
        title: "Create Job Tool",
        description: "Create a job posting with title, company, location, description, and required skills.",
        inputSchema: CreateJobSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: CreateJobInput, context) => {
        const results = await simulateCreateJob(params);
        if (!results.success) {
            return wrapStructured(makeError("CREATE_JOB_FAILED", "Failed to create job posting"));
        }
        return wrapStructured(results);
    },
);

// Delete Profile Tool
server.registerTool(
    "delete_profile",
    {
        title: "Delete Profile Tool",
        description: "Delete a user profile by ID.",
        inputSchema: DeleteProfileSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: DeleteProfileInput, context) => {
        const index = profiles.findIndex(p => p.id === params.id);
        if (index === -1)
            return wrapStructured(makeError("PROFILE_NOT_FOUND", "Profile not found"));

        profiles.splice(index, 1);
        return wrapStructured(makeSuccess({ message: "Profile deleted successfully" }));
    }
);

// Delete Job Tool
server.registerTool(
    "delete_job",
    {
        title: "Delete Job Tool",
        description: "Delete a job posting by ID.",
        inputSchema: DeleteJobSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: DeleteJobInput, context) => {
        const index = jobs.findIndex(j => j.id === params.id);
        if (index === -1)
            return wrapStructured(makeError("JOB_NOT_FOUND", "Job not found"));

        jobs.splice(index, 1);
        return wrapStructured(makeSuccess({ message: "Job deleted successfully" }));
    }
);

// matchJobsForProfile(profileId) Tool => return random 3 jobs from jobs array
server.registerTool(
    "match_jobs_for_profile",
    {
        title: "Match Jobs for Profile Tool",
        description: "Match job postings to a user profile based on skills, experience, and location.",
        inputSchema: MatchJobsForProfileSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: MatchJobsForProfileInput, context) => {
        const profile = profiles.find(p => p.id === params.profileId);
        if (!profile)
            return wrapStructured(makeError("PROFILE_NOT_FOUND", "Profile not found"));

        const jobsShuffled = jobs.sort(() => 0.5 - Math.random()).slice(0, 3);
        return wrapStructured(makeSuccess({ message: "Matching jobs found", jobs: jobsShuffled }));
    }
);

// matchProfilesForJob(jobId, options) Tool
server.registerTool(
    "match_profiles_for_job",
    {
        title: "Match Profiles for Job Tool",
        description: "Match user profiles to a job posting based on skills, experience, and location.",
        inputSchema: MatchProfilesForJobSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: MatchProfilesForJobInput, context) => {
        const job = jobs.find(j => j.id === params.jobId);
        if (!job)
            return wrapStructured(makeError("JOB_NOT_FOUND", "Job not found"));

        const profilesShuffled = profiles.sort(() => 0.5 - Math.random()).slice(0, 3);
        return wrapStructured(makeSuccess({ message: "Matching profiles found", profiles: profilesShuffled }));
    }
);

// List Profiles Resource (static URI: "/profiles")
server.registerResource(
    "list_profiles",
    "list://profiles",
    {
        title: "List All Profiles",
        description: "Returns all profile entries from in-memory database"
    },
    async (uri) => {
        return formatList(uri, profiles);
    }
);

// List Jobs Resource (static URI: "/jobs")
server.registerResource(
    "list_jobs",
    "list://jobs",
    {
        title: "List All Jobs",
        description: "Returns an array of all jobs in the system"
    },
    async (uri) => {
        return formatList(uri, jobs);
    }
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