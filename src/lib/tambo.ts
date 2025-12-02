/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This app provides a custom `updateRepl` tool that validates Strudel code
 * before updating the REPL. If the code is invalid, the tool throws an error
 * back to the AI so it can fix the pattern.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import type { InitialTamboThreadMessage, TamboComponent, TamboTool } from "@tambo-ai/react";
import { validateAndUpdateRepl } from "@/strudel/tools/validateAndUpdateRepl";
import { listSamples } from "@/strudel/tools/listSamples";
import { STRUDEL_SYSTEM_PROMPT } from "@/strudel/lib/prompt";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 */
export const tools: TamboTool[] = [validateAndUpdateRepl, listSamples];

/**
 * components
 *
 * No rendered components - the REPL is placed directly on the page and
 * updated via the updateRepl tool.
 */
export const components: TamboComponent[] = [];

export const initialMessages: InitialTamboThreadMessage[] = [
  {
    role: "system",
    content: [{ type: "text", text: STRUDEL_SYSTEM_PROMPT }],
  },
]