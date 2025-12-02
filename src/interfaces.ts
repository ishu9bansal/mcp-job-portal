import { z } from "zod";
import { ToolResponseSchema } from "./types.js";

/**
 * Interface for defining MCP tools in a consistent manner
 */
export interface ToolDefinition<TInput = any> {
    name: string;
    title: string;
    description: string;
    inputSchema: z.ZodType<TInput>;
    outputSchema: typeof ToolResponseSchema;
    handler: (params: TInput, context?: any) => Promise<any>;
}

/**
 * Interface for defining MCP resources in a consistent manner
 */
export interface ResourceDefinition {
    name: string;
    uri: string;
    title: string;
    description: string;
    handler: (uri: URL) => Promise<any>;
}

/**
 * Interface for defining MCP resource templates in a consistent manner
 */
export interface ResourceTemplateDefinition {
    name: string;
    uriTemplate: string;
    title: string;
    description: string;
    handler: (uri: URL) => Promise<any>;
}

/**
 * Helper function to wrap tool responses in the expected format
 */
export const wrapToolResponse = (results: any) => ({
    content: [
        { type: "text", text: JSON.stringify(results) }
    ],
    structuredContent: results
});

/**
 * Helper function to format resource list responses
 */
export const formatResourceList = (uri: URL, results: any[]) => ({
    contents: [
        {
            uri: String(uri),
            text: JSON.stringify({ items: results })
        }
    ],
    structuredContent: { items: results }
});

/**
 * Helper function to filter entities by query parameters
 */
export const filterEntities = <T extends Record<string, any>>(
    entities: T[],
    searchParams: URLSearchParams
): T[] => {
    if (!searchParams || searchParams.size === 0) {
        return entities;
    }

    return entities.filter(entity => {
        for (const [key, value] of searchParams.entries()) {
            const entityValue = entity[key];
            
            // Handle undefined or null values
            if (entityValue === undefined || entityValue === null) {
                return false;
            }

            // Handle array fields (like skills)
            if (Array.isArray(entityValue)) {
                // Check if the array contains the value (case-insensitive for strings)
                const hasMatch = entityValue.some(item => {
                    if (typeof item === 'string') {
                        return item.toLowerCase().includes(value.toLowerCase());
                    }
                    return String(item) === value;
                });
                if (!hasMatch) return false;
            }
            // Handle object fields (like experience)
            else if (typeof entityValue === 'object') {
                // Convert object to string and search within it
                const objectStr = JSON.stringify(entityValue).toLowerCase();
                if (!objectStr.includes(value.toLowerCase())) {
                    return false;
                }
            }
            // Handle string fields (case-insensitive partial match)
            else if (typeof entityValue === 'string') {
                if (!entityValue.toLowerCase().includes(value.toLowerCase())) {
                    return false;
                }
            }
            // Handle number fields (exact match)
            else if (typeof entityValue === 'number') {
                if (Number(value) !== entityValue) {
                    return false;
                }
            }
            // Default: string comparison
            else if (String(entityValue) !== value) {
                return false;
            }
        }
        return true;
    });
};
