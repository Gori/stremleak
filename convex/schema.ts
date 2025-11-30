import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    posts: defineTable({
        // Reddit post data
        redditId: v.string(),
        redditTitle: v.string(),
        redditUrl: v.string(),
        redditPermalink: v.string(),
        redditThumbnail: v.optional(v.string()),
        redditSelftext: v.optional(v.string()),
        redditCreatedUtc: v.number(),
        redditScore: v.number(), // Reddit upvotes/score

        // Stremio metadata
        stremioId: v.string(),
        name: v.string(),
        type: v.string(),
        poster: v.string(),
        description: v.string(),
        released: v.string(),
        background: v.optional(v.string()),

        // Metadata
        lastUpdated: v.number(),
        orderIndex: v.number(), // Position in /new/ feed (0 = newest)
    })
        .index("by_reddit_id", ["redditId"])
        .index("by_stremio_id", ["stremioId"])
        .index("by_order", ["orderIndex"])
        .index("by_score", ["redditScore"]),

    // Metadata table to track last refresh time
    metadata: defineTable({
        key: v.string(),
        value: v.any(),
        lastUpdated: v.number(),
    }).index("by_key", ["key"]),
});
