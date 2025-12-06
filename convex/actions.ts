import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

export const refreshRedditPosts = internalAction({
    args: {},
    handler: async (ctx) => {
        console.log("Starting Reddit refresh...");

        // Call the Node.js backend to fetch fresh data
        const addonUrl = process.env.ADDON_REFRESH_URL;
        const refreshToken = process.env.REFRESH_SECRET_TOKEN;

        console.log("Refresh token exists:", !!refreshToken);
        console.log("Addon URL:", addonUrl);

        if (!addonUrl) {
            console.error("ADDON_REFRESH_URL environment variable is not set!");
            return { success: false, error: "ADDON_REFRESH_URL not configured" };
        }

        try {
            const response = await fetch(addonUrl, {
                headers: refreshToken ? {
                    'x-refresh-token': refreshToken
                } : {}
            });

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
