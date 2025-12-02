import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';

import { type CreateProfileInput, CreateProfileSchema, Job, Profile } from "./types.js";
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
const profiles: Profile[] = [];
const jobs: Job[] = [];

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
        return makeError("DATABASE_ERROR", "Failed to create candidate profile", String(error));
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

// Simulated function to call match API for jobs based on profile
async function simulateMatchJobsForProfile(profileId: number): Promise<ToolResponse> {
    try {
        const profile = profiles.find(p => p.id === profileId);
        if (!profile) {
            return makeError("PROFILE_NOT_FOUND", `Profile with ID ${profileId} not found`);
        }

        // Simulate calling external match API
        // In production, this would be an actual API call to your matching service
        // For now, return random jobs as a simulation
        const matchedJobs = jobs.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        return makeSuccess({
            profileId: profileId,
            matchedJobs: matchedJobs,
            totalMatches: matchedJobs.length
        });
    } catch (error) {
        return makeError("MATCH_API_ERROR", "Failed to match jobs for profile", String(error));
    }
}

// Simulated function to call match API for profiles based on job
async function simulateMatchProfilesForJob(jobId: number): Promise<ToolResponse> {
    try {
        const job = jobs.find(j => j.id === jobId);
        if (!job) {
            return makeError("JOB_NOT_FOUND", `Job with ID ${jobId} not found`);
        }

        // Simulate calling external match API
        // In production, this would be an actual API call to your matching service
        // For now, return random profiles as a simulation
        const matchedProfiles = profiles.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        return makeSuccess({
            jobId: jobId,
            matchedProfiles: matchedProfiles,
            totalMatches: matchedProfiles.length
        });
    } catch (error) {
        return makeError("MATCH_API_ERROR", "Failed to match profiles for job", String(error));
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
        title: "Create Candidate Profile",
        description: "Create a new candidate profile with name, email, phone, skills, experience, and location preferences. Used by candidates to register themselves on the job matching platform.",
        inputSchema: CreateProfileSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: CreateProfileInput, context) => {
        const results = await simulateCreateProfile(params);
        if (!results.success) {
            return wrapStructured(makeError("CREATE_PROFILE_FAILED", "Failed to create candidate profile"));
        }
        return wrapStructured(results);
    }
);

// Register createJob tool
server.registerTool(
    "create_job",
    {
        title: "Create Job Posting",
        description: "Create a new job posting with title, company, location, description, required skills, and experience requirements. Used by job providers to post new job opportunities.",
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
        title: "Delete Candidate Profile",
        description: "Delete an existing candidate profile by ID. Used by candidates to remove their profile from the platform.",
        inputSchema: DeleteProfileSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: DeleteProfileInput, context) => {
        const index = profiles.findIndex(p => p.id === params.id);
        if (index === -1)
            return wrapStructured(makeError("PROFILE_NOT_FOUND", `Profile with ID ${params.id} not found`));

        const deletedProfile = profiles[index];
        profiles.splice(index, 1);
        return wrapStructured(makeSuccess({ 
            message: "Profile deleted successfully", 
            deletedProfile: { id: deletedProfile.id, name: deletedProfile.name } 
        }));
    }
);

// Delete Job Tool
server.registerTool(
    "delete_job",
    {
        title: "Delete Job Posting",
        description: "Delete an existing job posting by ID. Used by job providers to remove old or filled job postings.",
        inputSchema: DeleteJobSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: DeleteJobInput, context) => {
        const index = jobs.findIndex(j => j.id === params.id);
        if (index === -1)
            return wrapStructured(makeError("JOB_NOT_FOUND", `Job with ID ${params.id} not found`));

        const deletedJob = jobs[index];
        jobs.splice(index, 1);
        return wrapStructured(makeSuccess({ 
            message: "Job deleted successfully", 
            deletedJob: { id: deletedJob.id, title: deletedJob.title, company: deletedJob.company } 
        }));
    }
);

// Match Jobs for Profile Tool - calls external match API
server.registerTool(
    "match_jobs_for_profile",
    {
        title: "Match Jobs for Candidate Profile",
        description: "Find matching job opportunities for a candidate profile. Accepts profile ID and returns relevant jobs from the match API. Used by candidates to discover suitable job openings.",
        inputSchema: MatchJobsForProfileSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: MatchJobsForProfileInput, context) => {
        const results = await simulateMatchJobsForProfile(params.profileId);
        return wrapStructured(results);
    }
);

// Match Profiles for Job Tool - calls external match API
server.registerTool(
    "match_profiles_for_job",
    {
        title: "Match Candidates for Job Posting",
        description: "Find matching candidate profiles for a job posting. Accepts job ID and returns relevant candidates from the match API. Used by job providers to discover suitable candidates.",
        inputSchema: MatchProfilesForJobSchema,
        outputSchema: ToolResponseSchema
    },
    async (params: MatchProfilesForJobInput, context) => {
        const results = await simulateMatchProfilesForJob(params.jobId);
        return wrapStructured(results);
    }
);

// List Profiles Resource (static URI: "list://profiles")
server.registerResource(
    "list_profiles",
    "list://profiles",
    {
        title: "List All Candidate Profiles",
        description: "Returns all candidate profiles from the platform. Used by candidates to view all their registered profiles or by the system to show available candidates."
    },
    async (uri) => {
        return formatList(uri, profiles);
    }
);

// List Jobs Resource (static URI: "list://jobs")
server.registerResource(
    "list_jobs",
    "list://jobs",
    {
        title: "List All Job Postings",
        description: "Returns all job postings from the platform. Used by job providers to view all their posted jobs or by the system to show available opportunities."
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