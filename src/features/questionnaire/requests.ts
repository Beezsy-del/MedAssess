import { z } from "zod";
import { reportSchema, submissionIssues } from "./model";
export const patientToken = z.string().regex(/^([a-f0-9]{32}|[a-f0-9]{64})$/);
export const patientRequest = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("open"), token: patientToken }),
  z.strictObject({ action: z.literal("status") }),
  z.strictObject({ action: z.literal("emergency") }),
  z.strictObject({ action: z.literal("logout") }),
  z.strictObject({
    action: z.literal("draft"),
    answers: reportSchema,
    step: z.number().int().min(0).max(7),
  }),
  z
    .strictObject({
      action: z.literal("submit"),
      answers: reportSchema,
      operation_id: z.uuid(),
      previous_report_id: z.uuid().nullable(),
    })
    .superRefine((value, ctx) => {
      for (const message of submissionIssues(value.answers))
        ctx.addIssue({ code: "custom", message });
    }),
]);
