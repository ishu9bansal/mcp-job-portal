import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplateDefinition, formatResourceList, formatSingleResource, formatEmptyResource, filterEntities } from "./interfaces.js";
import { profiles, jobs } from "./database.js";


// TODO: define a consistent way of defining resource templates and handlers for each field of resource filtering
/**
 * Resource Template: Profile by ID
 */
export const profileByIdResource: ResourceTemplateDefinition = {
    name: "profile_by_id",
    template: new ResourceTemplate(
        "profile://{id}",
        {
            list: undefined,
            complete: {
                id: (value) => {
                    const matchingIds = profiles.map(p => p.id.toString()).filter(pid => pid.includes(value));
                    return matchingIds;
                }
            }
        }
    ),
    title: "Candidate Profile by ID",
    description: "Retrieve a candidate profile by its unique ID. Use profile://123 where 123 is the profile ID.",
    handler: async (uri, variables) => {
        const idParam = variables?.id;
        let stringIds: string[] = [];
        if (Array.isArray(idParam)) {
            stringIds = idParam;
        } else if (typeof idParam === "string") {
            stringIds = [idParam];
        }
        const ids = stringIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        const profile = profiles.find(p => ids.includes(p.id));
        
        if (!profile) {
            return formatEmptyResource();
        }

        return formatSingleResource(uri, profile);
    }
};

/**
 * Resource Template: Job by ID
 */
export const jobByIdResource: ResourceTemplateDefinition = {
    name: "job_by_id",
    template: new ResourceTemplate(
        "job://{id}",
        {
            list: undefined,
            complete: {
                id: (value) => {
                    const matchingIds = jobs.map(j => j.id.toString()).filter(jid => jid.includes(value));
                    return matchingIds;
                }
            }
        }
    ),
    title: "Job Posting by ID",
    description: "Retrieve a job posting by its unique ID. Use job://123 where 123 is the job ID.",
    handler: async (uri, variables) => {
        const idParam = variables?.id;
        let stringIds: string[] = [];
        if (Array.isArray(idParam)) {
            stringIds = idParam;
        } else if (typeof idParam === "string") {
            stringIds = [idParam];
        }
        const ids = stringIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        const job = jobs.find(j => ids.includes(j.id));
        
        if (!job) {
            return formatEmptyResource();
        }

        return formatSingleResource(uri, job);
    }
};

/**
 * Resource Template: Filter Profiles
 */
export const filterProfileByNameResource: ResourceTemplateDefinition = {
    name: "profiles_by_name",
    template: new ResourceTemplate(
        "profiles://name/{name}",
        {
            list: async () => ({
                resources: profiles.map(p => ({
                    uri: `profile://${p.id}`,
                    name: p.name,
                    description: `${p.name} - ${p.skills.join(", ")} - ${p.location || "Location not specified"}`,
                    mimeType: "application/json"
                }))
            })
        }
    ),
    title: "Filter Candidate Profiles",
    description: "Filter candidate profiles by name. Use profiles://name/john",
    handler: async (uri, variables) => {
        const searchParams = new URLSearchParams();
        searchParams.set('name', variables?.name as string || '');
        const filtered = filterEntities(profiles, searchParams);
        return formatResourceList(uri, filtered);
    }
};

/**
 * Resource Template: Filter Jobs
 */
export const filterJobsByTitleResource: ResourceTemplateDefinition = {
    name: "jobs_by_title",
    template: new ResourceTemplate(
        "jobs://title/{title}",
        {
            list: async () => ({
                resources: jobs.map(j => ({
                    uri: `job://${j.id}`,
                    name: j.title,
                    description: `${j.title} at ${j.company} - ${j.location} - ${j.skillsRequired.join(", ")}`,
                    mimeType: "application/json"
                }))
            })
        }
    ),
    title: "Filter Job Postings",
    description: "Filter job postings by title. Use jobs://title/UI Developer",
    handler: async (uri, variables) => {
        const searchParams = new URLSearchParams();
        searchParams.set('title', variables?.title as string || '');
        const filtered = filterEntities(jobs, searchParams);
        return formatResourceList(uri, filtered);
    }
};

/**
 * All resource templates available in the system
 */
export const allResources: ResourceTemplateDefinition[] = [
    profileByIdResource,
    jobByIdResource,
    filterProfileByNameResource,
    filterJobsByTitleResource,
];
