import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "refresh reddit posts",
    { hours: 1 }, // Run every hour
    internal.actions.refreshRedditPosts
);

export default crons;
