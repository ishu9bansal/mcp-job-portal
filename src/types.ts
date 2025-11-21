import { z } from "zod";

export type ToolResponse = {
    success: boolean;
    data: any | null;
    error: { code: string; message: string; details?: any } | null;
};

export const makeSuccess = (data: any): ToolResponse => ({
    success: true,
    data,
    error: null,
});

export const makeError = (code: string, message: string, details?: any): ToolResponse => ({
    success: false,
    data: null,
    error: { code, message, details },
});

// Schemas 
export const CreateProfileSchema = z.object({
    name: z.string().min(1, "Name is required").describe("Full name of the user (e.g., Shrey Singhal)"),
    email: z.string().email("Invalid email address").describe("Email address of the user (e.g., shreynbd@gmail.com)"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").describe("Contact phone number (e.g., 8057260114)"),
    skills: z.array(z.string()).describe("List of skills the user possesses (e.g., JavaScript, React)"),
    experience: z.array(z.object({
        company: z.string().min(1, "Company name is required"),
        role: z.string().min(1, "Role is required"),
        duration: z.string().min(1, "Duration is required"),
    })).describe("List of work experience (e.g., Software Developer at AppSquadz for 1 years)").optional(),
}).describe("Schema for creating a user profile");

export const CreateJobSchema = z.object({
    title: z.string().min(1, "Job title is required").describe("Title of the job (e.g., Software Backend Developer)"),
    company: z.string().min(1, "Company name is required").describe("Name of the company (e.g., AppSquadz)"),
    location: z.string().min(1, "Job location is required").describe("Location of the job (e.g., Remote or Noida Sector 90)"),
    experience: z.string().min(1, "Experience requirement is required").describe("Experience required for the job (e.g., 3+ years)").optional(),
    salary: z.number().min(0, "Salary must be a positive number").describe("Salary for the job (e.g., 100000)").optional(),
    description: z.string().min(10, "Job description must be at least 10 characters").describe("Description of the job (e.g., Responsible for developing backend services)"),
    skillsRequired: z.array(z.string()).describe("List of skills required for the job (e.g., Node.js, Express)"),
}).describe("Schema for creating a job posting");

// Infer TypeScript type from schema
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type CreateJobInput = z.infer<typeof CreateJobSchema>;

// Matching Options Schema
export const MatchOptionsSchema = z.object({
    limit: z.number().min(1).max(100).default(10).describe("Maximum number of matches to return (e.g., 10)").optional(),
    filters: z.object({
        location: z.string().optional().describe("Filter by location (e.g., Remote or Noida Sector 90)"),
        minExperience: z.number().min(0).optional().describe("Minimum years of experience required (e.g., 2)"),
    }).optional(),
    matchWeights: z.object({
        skillMatch: z.number().min(0).max(1).default(0.5).describe("Weight for skills matching (e.g., 0.5)").optional(),
        experienceMatch: z.number().min(0).max(1).default(0.3).describe("Weight for experience matching (e.g., 0.3)").optional(),
        location: z.number().min(0).max(1).default(0.2).describe("Weight for location matching (e.g., 0.2)").optional(),
    }).optional(),
}).describe("Options for matching profiles or jobs");

// Infer TypeScript type from MatchOptionsSchema
export type MatchOptions = z.infer<typeof MatchOptionsSchema>;

// Schemas for matching jobs to profiles and profiles to jobs
export const MatchJobsForProfileSchema = z.object({
    profileId: z.number().min(1, "Profile ID is required").describe("Unique identifier for the user profile (e.g., 1)"),
    options: MatchOptionsSchema.optional(),
}).describe("Schema for matching jobs to a user profile");

export const MatchProfilesForJobSchema = z.object({
    jobId: z.number().min(1, "Job ID is required").describe("Unique identifier for the job posting (e.g., 1)"),
    options: MatchOptionsSchema.optional(),
}).describe("Schema for matching profiles to a job posting");