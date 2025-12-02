import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolDefinition, ResourceTemplateDefinition } from "./interfaces.js";
import { allTools } from "./tools.js";
import { allResources } from "./resources.js";
import { type Variables } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";
import { profiles } from "./database.js";

/**
 * Create and configure the MCP server
 */
export function createMcpServer(): McpServer {
    const server = new McpServer({
        name: "job-portal-server",
        version: "1.0.0"
    });

    // Register all tools
    registerTools(server, allTools);

    // Register all resource templates
    registerResourceTemplates(server, []);

    return server;
}

/**
 * Register tools with the MCP server
 */
function registerTools(server: McpServer, tools: ToolDefinition[]): void {
    for (const tool of tools) {
        server.registerTool(
            tool.name,
            {
                title: tool.title,
                description: tool.description,
                inputSchema: tool.inputSchema,
                outputSchema: tool.outputSchema
            },
            tool.handler
        );
    }
}

const profileByIdTemplate = new ResourceTemplate(
    "profiles://{id}",
    {
        list: undefined,
        complete: {
            id: (value) => {
                const matchingIds =  profiles.map(p => p.id.toString()).filter(pid => pid.includes(value));
                return matchingIds;
            }
        }
    },
);

const profileByIdHandler = async (uri: URL, variables?: Variables) => {
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
        return {
            contents: [],
            structuredContent: { items: [] }
        };
    }

    return {
        contents: [
            {
                uri: String(uri),
                mimeType: "application/json",
                text: JSON.stringify(profile)
            }
        ],
        structuredContent: profile
    };
};

/**
 * Register resource templates with the MCP server
 */
function registerResourceTemplates(server: McpServer, resources: ResourceTemplateDefinition[]): void {
    for (const resource of resources) {
        server.registerResource(
            resource.name,
            resource.uriTemplate,
            {
                title: resource.title,
                description: resource.description
            },
            resource.handler
        );
    }
    server.registerResource(
        "profiles",
        profileByIdTemplate,
        {
            title: "Candidate Profile by ID",
            description: "Retrieve a candidate profile by its unique ID.",
        },
        profileByIdHandler,
    )
}
