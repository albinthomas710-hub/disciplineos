"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";

// Initialize OpenAI client with OpenRouter
const getOpenAI = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }
  
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://disciplineos.app",
      "X-Title": "DisciplineOS Manifestation AI",
    },
  });
};

// Analyze manifestation content for limiting beliefs
export const analyzeLimitingBeliefs = action({
  args: {
    manifestationId: v.id("manifestations"),
    content: v.string(),
    journalEntries: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    try {
      const openai = getOpenAI();
      
      const journalContext = args.journalEntries?.length 
        ? `\n\nRecent journal entries:\n${args.journalEntries.join("\n")}`
        : "";

      const completion = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku",
        messages: [
          {
            role: "system",
            content: "You are a manifestation psychology expert. Identify limiting beliefs and provide empowering reframes. Be direct, insightful, and actionable."
          },
          {
            role: "user",
            content: `Analyze this manifestation goal for limiting beliefs:\n\n"${args.content}"${journalContext}\n\nIdentify any limiting beliefs and provide powerful reframes. Format as JSON array: [{"belief": "...", "reframe": "..."}]`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content || "[]";
      const beliefs = JSON.parse(response);

      // Store insights
      await ctx.runMutation((internal as any).manifestations.addAIInsights as any, {
        manifestationId: args.manifestationId,
        insights: beliefs.map((b: any) => ({
          insight: `Limiting belief: "${b.belief}" → Reframe: "${b.reframe}"`,
          type: "limiting_belief" as const,
        })),
      });

      return beliefs;
    } catch (error) {
      console.error("AI analysis error:", error);
      return [];
    }
  },
});

// Generate personalized action suggestions
export const generateActionSuggestions = action({
  args: {
    manifestationId: v.id("manifestations"),
    goalType: v.string(),
    currentState: v.optional(v.string()),
    desiredState: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const openai = getOpenAI();

      const completion = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku",
        messages: [
          {
            role: "system",
            content: "You are a manifestation coach. Provide 3-5 specific, actionable micro-steps that can be done TODAY. Be practical and psychology-based."
          },
          {
            role: "user",
            content: `Goal type: ${args.goalType}\nCurrent: ${args.currentState || "Not specified"}\nDesired: ${args.desiredState || "Not specified"}\n\nProvide 3-5 micro-actions for TODAY. Format as JSON array of strings.`
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      const response = completion.choices[0].message.content || "[]";
      const actions = JSON.parse(response);

      // Store as AI insight
      await ctx.runMutation((internal as any).manifestations.addAIInsights, {
        manifestationId: args.manifestationId,
        insights: actions.map((action: string) => ({
          insight: action,
          type: "action_suggestion" as const,
        })),
      });

      return actions;
    } catch (error) {
      console.error("AI action generation error:", error);
      return [];
    }
  },
});

// Analyze patterns and provide encouragement
export const analyzeProgress = action({
  args: {
    manifestationId: v.id("manifestations"),
    actionStreak: v.number(),
    evidenceCount: v.number(),
    visualizationStreak: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const openai = getOpenAI();

      const completion = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku",
        messages: [
          {
            role: "system",
            content: "You are a manifestation coach. Analyze progress and provide powerful, motivating insights. Be authentic and psychology-based."
          },
          {
            role: "user",
            content: `Action streak: ${args.actionStreak} days\nEvidence collected: ${args.evidenceCount} items\nVisualization streak: ${args.visualizationStreak} days\n\nProvide a powerful insight about their progress and what to focus on next. Keep it under 100 words.`
          }
        ],
        max_tokens: 150,
        temperature: 0.9,
      });

      const insight = completion.choices[0].message.content || "";

      await ctx.runMutation((internal as any).manifestations.addAIInsights, {
        manifestationId: args.manifestationId,
        insights: [{
          insight,
          type: "pattern_recognition" as const,
        }],
      });

      return insight;
    } catch (error) {
      console.error("AI progress analysis error:", error);
      return "";
    }
  },
});