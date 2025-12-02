import { StrudelService } from "@/strudel/lib/service";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

const service = StrudelService.instance();

/**
 * validateAndUpdateRepl tool
 *
 * Validates Strudel code by evaluating it, then updates the REPL if valid.
 * If the code contains errors, the tool throws an error so the AI can fix it.
 */
export const validateAndUpdateRepl: TamboTool = {
  name: "updateRepl",
  description:
    "Update the Strudel REPL with new pattern code. The code is validated by running it through Strudel's evaluator first. If the code is invalid (contains undefined functions, syntax errors, etc.), the tool will fail with an error message. Always use this tool to update the REPL. Make sure the code and sequences are in the same key/scale and don't produce anything that will sound dissonant.",
  tool: async (
    code: string
  ): Promise<string> => {
    await service.init();
    const result = await service.updateAndPlay(code);

    if (!result.success) {
      throw new Error([
        'Invalid Strudel pattern. The code below contains syntax errors or undefined functions.',
        `Error: ${result.error}`,
        `Code: ${code}`
      ].join("\n\n"));
    }

    return "Message updated";
  },
  toolSchema: z
    .function()
    .args(
      z.string().describe(
        "The Strudel/Tidal pattern code to evaluate and display. Examples: s('bd sd') for drums, note('c3 e3 g3') for melodies, stack() for layering patterns."
      ),
    )
    .returns(
      z.promise(
        z.string()
      ).describe("The response message")
    ),
};