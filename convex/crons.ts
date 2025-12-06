import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "refresh reddit posts",
    { minutes: 30 }, // Run every 30 minutes
    internal.actions.refreshRedditPosts
);

export default crons;
