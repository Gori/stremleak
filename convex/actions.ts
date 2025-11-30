import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

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
    handler: async (ctx) => {
        return await ctx.runAction(internal.actions.refreshRedditPosts, {});
    },
});
