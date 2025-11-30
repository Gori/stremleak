import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const storePosts = internalMutation({
    args: {
        posts: v.array(v.object({
            redditId: v.string(),
            redditTitle: v.string(),
            redditUrl: v.string(),
            redditPermalink: v.string(),
            redditThumbnail: v.optional(v.string()),
            redditSelftext: v.optional(v.string()),
            redditCreatedUtc: v.number(),
            redditScore: v.number(),
            stremioId: v.string(),
            name: v.string(),
            type: v.string(),
            poster: v.string(),
            description: v.string(),
            released: v.string(),
            background: v.optional(v.string()),
            orderIndex: v.number(),
        }))
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Clear existing posts
        const existingPosts = await ctx.db.query("posts").collect();
        for (const post of existingPosts) {
            await ctx.db.delete(post._id);
        }

        // Insert new posts
        for (const post of args.posts) {
            await ctx.db.insert("posts", {
                ...post,
                lastUpdated: now,
            });
        }

        // Update last refresh metadata
        const metadataEntry = await ctx.db
            .query("metadata")
            .withIndex("by_key", (q) => q.eq("key", "last_reddit_refresh"))
            .first();

        if (metadataEntry) {
            await ctx.db.patch(metadataEntry._id, {
                value: now,
                lastUpdated: now,
            });
        } else {
            await ctx.db.insert("metadata", {
                key: "last_reddit_refresh",
                value: now,
                lastUpdated: now,
            });
        }

        return { count: args.posts.length, timestamp: now };
    },
});
