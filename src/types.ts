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
    name: z.string().min(1, "Name is required").describe("Full name of the candidate (e.g., Shrey Singhal)"),
    email: z.string().email("Invalid email address").describe("Email address of the candidate (e.g., shreynbd@gmail.com)"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").describe("Contact phone number (e.g., 8057260114)"),
    skills: z.array(z.string()).describe("List of skills the candidate possesses (e.g., JavaScript, React, Node.js)"),
    experience: z.array(z.object({
        company: z.string().min(1, "Company name is required"),
        role: z.string().min(1, "Role is required"),
        duration: z.string().min(1, "Duration is required"),
    })).optional().describe("List of work experience (e.g., Software Developer at AppSquadz for 1 years)"),
    location: z.string().optional().describe("Preferred work location (e.g., Remote, Noida)"),
}).describe("Schema for creating a candidate profile");

export const CreateJobSchema = z.object({
    title: z.string().min(1, "Job title is required").describe("Title of the job (e.g., Software Backend Developer)"),
    company: z.string().min(1, "Company name is required").describe("Name of the company (e.g., AppSquadz)"),
    location: z.string().min(1, "Job location is required").describe("Location of the job (e.g., Remote or Noida Sector 90)"),
    experienceRequired: z.string().optional().describe("Experience required for the job (e.g., 3+ years)"),
    salary: z.number().min(0, "Salary must be a positive number").optional().describe("Salary for the job (e.g., 100000)"),
    description: z.string().min(10, "Job description must be at least 10 characters").describe("Description of the job (e.g., Responsible for developing backend services)"),
    skillsRequired: z.array(z.string()).describe("List of skills required for the job (e.g., Node.js, Express, MongoDB)"),
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
    profileId: z.number().min(1, "Profile ID is required").describe("Unique identifier for the candidate profile to match jobs against (e.g., 1)")
}).describe("Schema for matching jobs to a candidate profile. Returns matching job opportunities.");

export const MatchProfilesForJobSchema = z.object({
    jobId: z.number().min(1, "Job ID is required").describe("Unique identifier for the job posting to match candidates against (e.g., 1)")
}).describe("Schema for matching candidate profiles to a job posting. Returns matching candidates.");

// Infer TypeScript type from schema
export type MatchJobsForProfileInput = z.infer<typeof MatchJobsForProfileSchema>;
export type MatchProfilesForJobInput = z.infer<typeof MatchProfilesForJobSchema>;

/* ---------- Match Response Types ---------- */
export type JobMatchResult = CreateJobInput & { id: number; matchScore?: number };
export type ProfileMatchResult = CreateProfileInput & { id: number; matchScore?: number };

/* ---------- Profile & Job Types ---------- */
export type Profile = CreateProfileInput & { id: number };
export type Job = CreateJobInput & { id: number };
