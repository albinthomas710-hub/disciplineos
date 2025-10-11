/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as completionLogs from "../completionLogs.js";
import type * as dopamineShield from "../dopamineShield.js";
import type * as http from "../http.js";
import type * as kitchenReclaim from "../kitchenReclaim.js";
import type * as realityAnchor from "../realityAnchor.js";
import type * as reflections from "../reflections.js";
import type * as seedData from "../seedData.js";
import type * as timeBlocks from "../timeBlocks.js";
import type * as timetables from "../timetables.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  completionLogs: typeof completionLogs;
  dopamineShield: typeof dopamineShield;
  http: typeof http;
  kitchenReclaim: typeof kitchenReclaim;
  realityAnchor: typeof realityAnchor;
  reflections: typeof reflections;
  seedData: typeof seedData;
  timeBlocks: typeof timeBlocks;
  timetables: typeof timetables;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
