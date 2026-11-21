// Generates strict SQL shape checks from the same schema used by the patient API.
// Run with Node's built-in TypeScript stripping (Node 24+). Output contains no data.
import { z } from "zod";
import { reportSchema } from "../src/features/questionnaire/model.ts";
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
function expression(schema, value) {
  if (schema.anyOf)
    return `(${schema.anyOf.map((s) => expression(s, value)).join(" or ")})`;
  if (schema.const !== undefined)
    return `${value}=${quote(JSON.stringify(schema.const))}::jsonb`;
  if (schema.enum)
    return `${value} in (${schema.enum.map((v) => `${quote(JSON.stringify(v))}::jsonb`).join(",")})`;
  const type = schema.type;
  if (type === "null") return `${value}='null'::jsonb`;
  if (type === "object") {
    const properties = schema.properties ?? {};
    const checks = [`jsonb_typeof(${value})='object'`];
    for (const key of schema.required ?? [])
      checks.push(`${value}?${quote(key)}`);
    for (const [key, s] of Object.entries(properties))
      checks.push(expression(s, `(${value}->${quote(key)})`));
    if (schema.additionalProperties === false)
      checks.push(
        `(${value}-array[${Object.keys(properties).map(quote).join(",")}]::text[])='{}'::jsonb`,
      );
    // The answers record is separately restricted to the active question keys in the API.
    if (
      schema.additionalProperties &&
      typeof schema.additionalProperties === "object"
    )
      checks.push(
        `not exists(select 1 from jsonb_each(case when jsonb_typeof(${value})='object' then ${value} else '{}'::jsonb end) item where not coalesce(${expression(schema.additionalProperties, "item.value")},false))`,
      );
    return `(${checks.join(" and ")})`;
  }
  if (type === "array")
    return `(case when jsonb_typeof(${value})='array' then jsonb_array_length(${value}) between ${schema.minItems ?? 0} and ${schema.maxItems ?? 100} and not exists(select 1 from jsonb_array_elements(${value}) item where not coalesce(${expression(schema.items, "item.value")},false)) else false end)`;
  if (type === "number" || type === "integer")
    return `(case when jsonb_typeof(${value})='number' then (${value}::text)::numeric between ${schema.minimum ?? "-1e100"} and ${schema.maximum ?? "1e100"}${type === "integer" ? ` and trunc((${value}::text)::numeric)=(${value}::text)::numeric` : ""} else false end)`;
  const checks = [`jsonb_typeof(${value})=${quote(type)}`];
  if (type === "string") {
    checks.push(
      `length(${value}#>>'{}') between ${schema.minLength ?? 0} and ${schema.maxLength ?? 3000}`,
    );
    if (schema.format === "date")
      checks.push(`(${value}#>>'{}') ~ '^\\d{4}-\\d{2}-\\d{2}$'`);
  }
  return `(${checks.join(" and ")})`;
}
console.log(
  `create function private.patient_report_shape(a jsonb) returns boolean language sql immutable set search_path='' as $$\nselect coalesce(${expression(z.toJSONSchema(reportSchema), "a")},false)\n$$;\nrevoke all on function private.patient_report_shape(jsonb) from public,anon,authenticated;`,
);
