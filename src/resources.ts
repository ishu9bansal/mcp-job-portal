import { ResourceTemplateDefinition, formatResourceList, filterEntities } from "./interfaces.js";
import { profiles, jobs } from "./database.js";

/**
 * Resource Template: Filter Candidate Profiles
 * Supports filtering by any profile field using query parameters
 * Examples:
 *   profiles://filter?name=John
 *   profiles://filter?location=Remote
 *   profiles://filter?skills=JavaScript
 *   profiles://filter?skills=React&location=Bangalore
 */
export const filterProfilesResource: ResourceTemplateDefinition = {
    name: "filter_profiles",
    uriTemplate: "profiles://filter{?name,email,phone,location,skills,company,role}",
    title: "Filter Candidate Profiles",
    description: "Filter candidate profiles by any field. Supports partial matching for text fields and array fields. Query parameters: name, email, phone, location, skills (matches any skill), company (in experience), role (in experience).",
    handler: async (uri) => {
        const searchParams = new URL(uri).searchParams;
        const filtered = filterEntities(profiles, searchParams);
        
        return formatResourceList(uri, filtered);
    }
};

/**
 * Resource Template: Filter Job Postings
 * Supports filtering by any job field using query parameters
 * Examples:
 *   jobs://filter?title=Developer
 *   jobs://filter?company=Tech
 *   jobs://filter?location=Remote
 *   jobs://filter?skillsRequired=JavaScript
 *   jobs://filter?skillsRequired=React&location=Bangalore
 */
export const filterJobsResource: ResourceTemplateDefinition = {
    name: "filter_jobs",
    uriTemplate: "jobs://filter{?title,company,location,experienceRequired,salary,description,skillsRequired}",
    title: "Filter Job Postings",
    description: "Filter job postings by any field. Supports partial matching for text fields and array fields. Query parameters: title, company, location, experienceRequired, salary, description, skillsRequired (matches any required skill).",
    handler: async (uri) => {
        const searchParams = new URL(uri).searchParams;
        const filtered = filterEntities(jobs, searchParams);
        
        return formatResourceList(uri, filtered);
    }
};

/**
 * All resource templates available in the system
 */
export const allResources: ResourceTemplateDefinition[] = [
    filterProfilesResource,
    filterJobsResource,
];
