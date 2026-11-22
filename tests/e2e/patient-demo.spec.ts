import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ context, baseURL }) => {
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (bypass && baseURL)
    await context.route(`${new URL(baseURL).origin}/**`, async (route) => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          "x-vercel-protection-bypass": bypass,
        },
      });
    });
});
test("token-free demo runs all scenarios, staff handover and reset without clinical API traffic", async ({
  page,
  context,
}) => {
  const forbidden: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname.startsWith("/api/") ||
      url.hostname.endsWith("supabase.co") ||
      url.port === "54321"
    )
      forbidden.push(url.pathname);
  });
  await page.goto("/login");
  await page
    .getByRole("link", { name: "Enter Patient Portal", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Real Patient Access", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Explore Demo Mode", exact: true })
    .click();
  await expect(page).toHaveURL(/\/patient-portal\/demo$/);
  await expect(
    page.getByText(
      "DEMO MODE — SYNTHETIC PATIENT DATA — NOT FOR REAL CLINICAL USE",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByLabel("Private access token")).toHaveCount(0);
  const nav = page.getByRole("navigation", { name: "Demo sections" });
  const submit = async () => {
    await page.getByLabel("I reviewed these fictional answers").check();
    await page
      .getByRole("button", { name: "Submit Assessment", exact: true })
      .click();
  };
  for (const [name, category] of [
    ["GREEN — General Waiting", "GREEN"],
    ["YELLOW — Urgent Assessment", "YELLOW"],
    ["Existing Medical History", "GREEN"],
  ]) {
    await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    await submit();
    await expect(
      page.getByRole("region", { name: "Simulated result" }),
    ).toContainText(`SIMULATED ${category}`);
  }
  await nav
    .getByRole("button", { name: "Simulated care team", exact: true })
    .click();
  await expect(
    page.getByText("diabetes, hypertension", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Example maintenance medicine", { exact: false }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Acknowledge simulated alerts", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Record simulated nurse reassessment",
      exact: true,
    })
    .click();
  await page
    .getByRole("combobox", { name: "Doctor action", exact: true })
    .selectOption("Referral");
  await page
    .getByRole("button", {
      name: "Record simulated doctor action",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "View patient timeline", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Simulated doctor referral",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Return to Patient Portal Demo Home",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: /^Dynamic Escalation/ }).click();
  await submit();
  await page
    .getByRole("button", { name: "My Symptoms Have Changed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit symptom update", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Simulated result" }),
  ).toContainText("Previous: GREEN → Current: YELLOW");
  await page
    .getByRole("button", { name: "My Symptoms Have Changed", exact: true })
    .click();
  await page.getByLabel("Configured demonstration update").selectOption("RED");
  await page
    .getByRole("button", { name: "Submit symptom update", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Simulated result" }),
  ).toContainText("Previous: YELLOW → Current: RED");
  await page.getByRole("button", { name: /^RED — Emergency/ }).click();
  await expect(
    page.getByRole("region", { name: "Simulated result" }),
  ).toContainText("Alert nearby hospital staff immediately");
  await page
    .getByRole("button", { name: "View notifications", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Simulated emergency nurse and duty doctor alert",
      exact: true,
    }),
  ).toBeVisible();
  await nav.getByRole("button", { name: "Demo QR code", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /Illustrative demo QR/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset Demo", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Simulated result" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "View patient timeline", exact: true })
    .click();
  await expect(page.locator(".demo-timeline li")).toHaveCount(1);
  await page
    .getByRole("button", { name: "View notifications", exact: true })
    .click();
  await expect(
    page.getByText("No simulated notifications yet.", { exact: false }),
  ).toBeVisible();
  expect(forbidden).toEqual([]);
  expect(
    (await context.cookies()).filter(
      (c) => c.name.startsWith("sb-") || c.name === "medcipher-patient-session",
    ),
  ).toEqual([]);
  await page.screenshot({
    path: "output/playwright/patient-demo-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});

test("demo questionnaire supports branching, manual review and emergency bypass", async ({
  page,
}) => {
  await page.goto("/patient-portal/demo");
  await page
    .getByRole("button", { name: "Start from beginning", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Main health complaint")
    .fill("Synthetic demonstration bleeding and injury");
  await page.getByRole("checkbox", { name: "bleeding", exact: true }).check();
  await page.getByRole("checkbox", { name: "injury", exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Where is the bleeding?")).toBeVisible();
  await expect(page.getByLabel("What caused the injury?")).toBeVisible();
  await expect(page.getByLabel("How long have you had a fever?")).toHaveCount(
    0,
  );
  await page.getByLabel("Where is the bleeding?").fill("Fictional arm");
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Fictional arm", { exact: true })).toBeVisible();
  await page.getByLabel("I reviewed these fictional answers").check();
  await page
    .getByRole("button", { name: "Submit Assessment", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Simulated result" }),
  ).toContainText("SIMULATED GREEN");
  await page
    .getByRole("button", { name: "Start from beginning", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Simulate emergency assistance", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Simulated result" }),
  ).toContainText("SIMULATED RED");
});
