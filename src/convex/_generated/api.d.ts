/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as advice from "../advice.js";
import type * as affirmationIdeas from "../affirmationIdeas.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as categories from "../categories.js";
import type * as completionLogs from "../completionLogs.js";
import type * as crons from "../crons.js";
import type * as dopamineShield from "../dopamineShield.js";
import type * as eightyTwenty from "../eightyTwenty.js";
import type * as emergencyTriggers from "../emergencyTriggers.js";
import type * as entrepreneurActions from "../entrepreneurActions.js";
import type * as entrepreneurOS from "../entrepreneurOS.js";
import type * as futureTimelineQueries from "../futureTimelineQueries.js";
import type * as hardDeadlines from "../hardDeadlines.js";
import type * as holyVideos from "../holyVideos.js";
import type * as http from "../http.js";
import type * as ideas from "../ideas.js";
import type * as impactValidation from "../impactValidation.js";
import type * as kitchenReclaim from "../kitchenReclaim.js";
import type * as legendProfiles from "../legendProfiles.js";
import type * as manifestationAI from "../manifestationAI.js";
import type * as manifestationActions from "../manifestationActions.js";
import type * as manifestations from "../manifestations.js";
import type * as notToDoList from "../notToDoList.js";
import type * as notes from "../notes.js";
import type * as prayers from "../prayers.js";
import type * as problemVault from "../problemVault.js";
import type * as projects from "../projects.js";
import type * as quoteChains from "../quoteChains.js";
import type * as quotes from "../quotes.js";
import type * as realityAnchor from "../realityAnchor.js";
import type * as recovery from "../recovery.js";
import type * as reflectionTriggers from "../reflectionTriggers.js";
import type * as reflections from "../reflections.js";
import type * as scriptures from "../scriptures.js";
import type * as security from "../security.js";
import type * as seedData from "../seedData.js";
import type * as selfDiscovery from "../selfDiscovery.js";
import type * as streaks from "../streaks.js";
import type * as timeBlockValidation from "../timeBlockValidation.js";
import type * as timeBlocks from "../timeBlocks.js";
import type * as timetables from "../timetables.js";
import type * as users from "../users.js";
import type * as vectal from "../vectal.js";
import type * as videoLibrary from "../videoLibrary.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  advice: typeof advice;
  affirmationIdeas: typeof affirmationIdeas;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  categories: typeof categories;
  completionLogs: typeof completionLogs;
  crons: typeof crons;
  dopamineShield: typeof dopamineShield;
  eightyTwenty: typeof eightyTwenty;
  emergencyTriggers: typeof emergencyTriggers;
  entrepreneurActions: typeof entrepreneurActions;
  entrepreneurOS: typeof entrepreneurOS;
  futureTimelineQueries: typeof futureTimelineQueries;
  hardDeadlines: typeof hardDeadlines;
  holyVideos: typeof holyVideos;
  http: typeof http;
  ideas: typeof ideas;
  impactValidation: typeof impactValidation;
  kitchenReclaim: typeof kitchenReclaim;
  legendProfiles: typeof legendProfiles;
  manifestationAI: typeof manifestationAI;
  manifestationActions: typeof manifestationActions;
  manifestations: typeof manifestations;
  notToDoList: typeof notToDoList;
  notes: typeof notes;
  prayers: typeof prayers;
  problemVault: typeof problemVault;
  projects: typeof projects;
  quoteChains: typeof quoteChains;
  quotes: typeof quotes;
  realityAnchor: typeof realityAnchor;
  recovery: typeof recovery;
  reflectionTriggers: typeof reflectionTriggers;
  reflections: typeof reflections;
  scriptures: typeof scriptures;
  security: typeof security;
  seedData: typeof seedData;
  selfDiscovery: typeof selfDiscovery;
  streaks: typeof streaks;
  timeBlockValidation: typeof timeBlockValidation;
  timeBlocks: typeof timeBlocks;
  timetables: typeof timetables;
  users: typeof users;
  vectal: typeof vectal;
  videoLibrary: typeof videoLibrary;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
