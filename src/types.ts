import { z } from "zod";

/* ---------- Standard Tool Response Schema (Zod) ---------- */
export const ErrorObjectSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
});

export const ToolResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().nullable(),
    error: ErrorObjectSchema.nullable(),
});
export type ToolResponse = z.infer<typeof ToolResponseSchema>;

/* ---------- Helpers ---------- */
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

/* ---------- Profile & Job Schemas ---------- */
export const CreateProfileSchema = z.object({
    name: z.string().min(1, "Name is required").describe("Full name of the user (e.g., Shrey Singhal)"),
    email: z.string().email("Invalid email address").describe("Email address of the user (e.g., shreynbd@gmail.com)"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").describe("Contact phone number (e.g., 8057260114)"),
    skills: z.array(z.string()).describe("List of skills the user possesses (e.g., JavaScript, React)"),
    experience: z.array(z.object({
        company: z.string().min(1, "Company name is required"),
        role: z.string().min(1, "Role is required"),
        duration: z.string().min(1, "Duration is required"),
    })).optional().describe("List of work experience (e.g., Software Developer at AppSquadz for 1 years)"),
}).describe("Schema for creating a user profile");

export const CreateJobSchema = z.object({
    title: z.string().min(1, "Job title is required").describe("Title of the job (e.g., Software Backend Developer)"),
    company: z.string().min(1, "Company name is required").describe("Name of the company (e.g., AppSquadz)"),
    location: z.string().min(1, "Job location is required").describe("Location of the job (e.g., Remote or Noida Sector 90)"),
    experience: z.string().min(1, "Experience requirement is required").describe("Experience required for the job (e.g., 3+ years)").optional(),
    salary: z.number().min(0, "Salary must be a positive number").describe("Salary for the job (e.g., 100000)").optional(),
    description: z.string().min(10, "Job description must be at least 10 characters").describe("Description of the job (e.g., Responsible for developing backend services)"),
    skillsRequired: z.array(z.string()).optional().describe("List of skills required for the job (e.g., Node.js, Express)"),
}).describe("Schema for creating a job posting");

// Infer TypeScript type from schema
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type CreateJobInput = z.infer<typeof CreateJobSchema>;


/* ---------- Delete Profile & Job Schemas ---------- */
export const DeleteProfileSchema = z.object({
    id: z.number().min(1, "Profile ID is Required").describe("ID of the profile to delete")
}).describe("Schema for deleting a user profile");

export const DeleteJobSchema = z.object({
    id: z.number().min(1, "Job ID is Required").describe("ID of the job to delete")
}).describe("Schema for deleting a job posting");

// Infer TypeScript type from schema
export type DeleteProfileInput = z.infer<typeof DeleteProfileSchema>;
export type DeleteJobInput = z.infer<typeof DeleteJobSchema>;

/* ---------- Match Schemas ---------- */
export const MatchJobsForProfileSchema = z.object({
    profileId: z.number().min(1, "Profile ID is required").describe("Unique identifier for the user profile (e.g., 1)")
}).describe("Schema for matching jobs to a user profile");

export const MatchProfilesForJobSchema = z.object({
    jobId: z.number().min(1, "Job ID is required").describe("Unique identifier for the job posting (e.g., 1)")
}).describe("Schema for matching profiles to a job posting");

// Infer TypeScript type from schema
export type MatchJobsForProfileInput = z.infer<typeof MatchJobsForProfileSchema>;
export type MatchProfilesForJobInput = z.infer<typeof MatchProfilesForJobSchema>;