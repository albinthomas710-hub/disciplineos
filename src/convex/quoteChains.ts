import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all chains for current user
export const getUserChains = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const chains = await ctx.db
      .query("quoteChains")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return chains.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Create a new chain
export const createChain = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    theme: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("quoteChains", {
      userId: user._id,
      name: args.name,
      description: args.description,
      theme: args.theme,
      color: args.color || "from-indigo-500 to-purple-500",
      createdAt: Date.now(),
    });
  },
});

// Delete a chain
export const deleteChain = mutation({
  args: {
    chainId: v.id("quoteChains"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chain = await ctx.db.get(args.chainId);
    if (!chain || chain.userId !== user._id) {
      throw new Error("Chain not found or unauthorized");
    }

    // Remove chain reference from all quotes
    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_user_and_chain", (q) => 
        q.eq("userId", user._id).eq("chainId", args.chainId)
      )
      .collect();

    for (const quote of quotes) {
      await ctx.db.patch(quote._id, {
        chainId: undefined,
        chainOrder: undefined,
      });
    }

    await ctx.db.delete(args.chainId);
  },
});
