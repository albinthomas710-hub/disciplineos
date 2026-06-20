import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all quotes for current user
export const getUserQuotes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return quotes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get favorite quotes
export const getFavoriteQuotes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_user_and_favorite", (q) => 
        q.eq("userId", user._id).eq("isFavorite", true)
      )
      .collect();

    return quotes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get quotes by author
export const getByAuthor = query({
  args: { author: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_user_and_author", (q) => 
        q.eq("userId", user._id).eq("author", args.author)
      )
      .collect();

    return quotes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get quotes in a chain
export const getChainQuotes = query({
  args: { chainId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_user_and_chain", (q) => 
        q.eq("userId", user._id).eq("chainId", args.chainId)
      )
      .collect();

    return quotes.sort((a, b) => (a.chainOrder || 0) - (b.chainOrder || 0));
  },
});

// Get all unique authors
export const getAuthors = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const authorsMap = new Map<string, number>();
    quotes.forEach(quote => {
      authorsMap.set(quote.author, (authorsMap.get(quote.author) || 0) + 1);
    });

    return Array.from(authorsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },
});

// Auto-categorize quote using simple keyword matching
function autoCategorize(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/discipl|habit|consist|routine|daily/)) return "discipline";
  if (lowerText.match(/motiv|inspir|dream|passion|purpose/)) return "motivation";
  if (lowerText.match(/success|achiev|win|victor|triumph/)) return "success";
  if (lowerText.match(/resilien|persever|overcome|struggle|fail/)) return "resilience";
  if (lowerText.match(/focus|concentrat|attention|mindful/)) return "focus";
  if (lowerText.match(/action|do|execut|implement|start/)) return "action";
  if (lowerText.match(/wisdom|learn|knowledge|understand/)) return "wisdom";
  if (lowerText.match(/courage|brave|fear|bold/)) return "courage";
  
  return "general";
}

// Generate tags for better discovery
function generateTags(text: string, author: string): string[] {
  const tags: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Theme tags
  if (lowerText.match(/time|hour|day|moment/)) tags.push("time");
  if (lowerText.match(/work|effort|labor/)) tags.push("work");
  if (lowerText.match(/goal|target|aim/)) tags.push("goals");
  if (lowerText.match(/mind|think|thought/)) tags.push("mindset");
  if (lowerText.match(/life|living|exist/)) tags.push("life");
  
  // Author tag
  tags.push(author.toLowerCase().replace(/\s+/g, "-"));
  
  return tags;
}

// Add a new quote with auto-categorization
export const addQuote = mutation({
  args: {
    text: v.string(),
    author: v.string(),
    category: v.optional(v.string()),
    chainId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Auto-categorize if no category provided
    const category = args.category || autoCategorize(args.text);
    const tags = generateTags(args.text, args.author);

    // Get chain order if adding to a chain
    let chainOrder: number | undefined;
    if (args.chainId) {
      const chainQuotes = await ctx.db
        .query("quotes")
        .withIndex("by_user_and_chain", (q) => 
          q.eq("userId", user._id).eq("chainId", args.chainId)
        )
        .collect();
      chainOrder = chainQuotes.length + 1;
    }

    return await ctx.db.insert("quotes", {
      userId: user._id,
      text: args.text,
      author: args.author,
      category,
      isFavorite: false,
      createdAt: Date.now(),
      chainId: args.chainId,
      chainOrder,
      tags,
    });
  },
});

// Toggle favorite status
export const toggleFavorite = mutation({
  args: {
    quoteId: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const quote = await ctx.db.get(args.quoteId);
    if (!quote || quote.userId !== user._id) {
      throw new Error("Quote not found or unauthorized");
    }

    await ctx.db.patch(args.quoteId, {
      isFavorite: !quote.isFavorite,
    });
  },
});

// Delete a quote
export const deleteQuote = mutation({
  args: {
    quoteId: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const quote = await ctx.db.get(args.quoteId);
    if (!quote || quote.userId !== user._id) {
      throw new Error("Quote not found or unauthorized");
    }

    await ctx.db.delete(args.quoteId);
  },
});

// Add quote to chain
export const addToChain = mutation({
  args: {
    quoteId: v.id("quotes"),
    chainId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const quote = await ctx.db.get(args.quoteId);
    if (!quote || quote.userId !== user._id) {
      throw new Error("Quote not found or unauthorized");
    }

    // Get chain order
    const chainQuotes = await ctx.db
      .query("quotes")
      .withIndex("by_user_and_chain", (q) => 
        q.eq("userId", user._id).eq("chainId", args.chainId)
      )
      .collect();

    await ctx.db.patch(args.quoteId, {
      chainId: args.chainId,
      chainOrder: chainQuotes.length + 1,
    });
  },
});

// Remove quote from chain
export const removeFromChain = mutation({
  args: {
    quoteId: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const quote = await ctx.db.get(args.quoteId);
    if (!quote || quote.userId !== user._id) {
      throw new Error("Quote not found or unauthorized");
    }

    await ctx.db.patch(args.quoteId, {
      chainId: undefined,
      chainOrder: undefined,
    });
  },
});