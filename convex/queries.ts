import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPosts = query({
    args: {},
    handler: async (ctx) => {
        const posts = await ctx.db
            .query("posts")
            .withIndex("by_order")
            .order("asc")
            .collect();

        return posts.map(post => ({
            id: post.stremioId,
            name: post.name,
            type: post.type,
            poster: post.poster,
            description: post.description,
            released: post.released,
            background: post.background,
            originalPost: {
                id: post.redditId,
                title: post.redditTitle,
                url: post.redditUrl,
                permalink: post.redditPermalink,
                thumbnail: post.redditThumbnail,
            }
        }));
    },
});

export const getPostById = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        const post = await ctx.db
            .query("posts")
            .withIndex("by_stremio_id", (q) => q.eq("stremioId", args.id))
            .first();

        if (!post) return null;

        return {
            id: post.stremioId,
            name: post.name,
            type: post.type,
            poster: post.poster,
            description: post.description,
            released: post.released,
            background: post.background,
            originalPost: {
                id: post.redditId,
                title: post.redditTitle,
                url: post.redditUrl,
                permalink: post.redditPermalink,
                thumbnail: post.redditThumbnail,
            }
        };
    },
});

export const getLastRefreshTime = query({
    args: {},
    handler: async (ctx) => {
        const metadata = await ctx.db
            .query("metadata")
            .withIndex("by_key", (q) => q.eq("key", "last_reddit_refresh"))
            .first();

        return metadata?.value || null;
    },
});

export const getTopMonthlyPosts = query({
    args: {},
    handler: async (ctx) => {
        // Calculate timestamp for 30 days ago
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

        // Get all posts
        const allPosts = await ctx.db
            .query("posts")
            .collect();

        // Filter posts from the past 30 days and sort by score
        const topMonthlyPosts = allPosts
            .filter(post => post.redditCreatedUtc >= thirtyDaysAgo)
            .sort((a, b) => (b.redditScore ?? 0) - (a.redditScore ?? 0));

        return topMonthlyPosts.map(post => ({
            id: post.stremioId,
            name: post.name,
            type: post.type,
            poster: post.poster,
            description: post.description,
            released: post.released,
            background: post.background,
            originalPost: {
                id: post.redditId,
                title: post.redditTitle,
                url: post.redditUrl,
                permalink: post.redditPermalink,
                thumbnail: post.redditThumbnail,
                score: post.redditScore,
            }
        }));
    },
});
