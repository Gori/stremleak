import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

export const refreshRedditPosts = internalAction({
    args: {},
    handler: async (ctx) => {
        console.log("Starting Reddit refresh...");

        // Call the Node.js backend to fetch fresh data
        // This endpoint will be created in the addon
        const addonUrl = process.env.ADDON_REFRESH_URL || "http://localhost:7001/internal/refresh";

        try {
            const response = await fetch(addonUrl);

            if (!response.ok) {
                console.error("Failed to refresh from Reddit:", response.statusText);
                return { success: false, error: response.statusText };
            }

            const data = await response.json();

            // Type guard to ensure data has the expected structure
            if (typeof data !== 'object' || data === null || !('posts' in data) || !Array.isArray(data.posts)) {
                console.error("Invalid data structure received from refresh endpoint:", data);
                return { success: false, error: "Invalid data structure" };
            }

            // Store the posts
            await ctx.runMutation(internal.mutations.storePosts, {
                posts: data.posts,
            });

            console.log(`Successfully refreshed ${data.posts.length} posts`);
            return { success: true, count: data.posts.length };
        } catch (error) {
            console.error("Error during refresh:", error);
            return { success: false, error: String(error) };
        }
    },
});

// Manual trigger for testing/initial load
export const manualRefresh = action({
    args: {},
    handler: async (ctx): Promise<{ success: boolean; count?: number; error?: string }> => {
        return await ctx.runAction(internal.actions.refreshRedditPosts, {});
    },
});
