import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function login(page: import("@playwright/test").Page, role: string) {
  const response = await page.request.post("/api/auth", {
    headers: { origin: process.env.BASE_URL ?? "http://localhost:3011" },
    data: { action: "demo", role },
  });
  expect(response.ok()).toBe(true);
  return (await response.json()).redirect;
}
test("patient manual access, adaptive report, saved progress, staff brief and dynamic escalation", async ({
  page,
  browser,
  baseURL,
}) => {
  const landing = await login(page, "nurse");
  await page.goto(landing);
  const snapshot = await (await page.request.get("/api/snapshot")).json();
  const createdResponse = await page.request.post("/api/command", {
    headers: { origin: baseURL! },
    data: {
      hospital: snapshot.hospital.id,
      action: "register",
      data: {
        operation_id: crypto.randomUUID(),
        name: `Synthetic adaptive browser ${Date.now()}`,
      },
    },
  });
  expect(createdResponse.ok()).toBe(true);
  const created = await createdResponse.json();
  const patientContext = await browser.newContext({ baseURL });
  const patient = await patientContext.newPage();
  await patient.goto("/login");
  await patient
    .getByRole("link", { name: "Enter Patient Portal", exact: true })
    .click();
  await expect(patient).toHaveURL(/\/patient-portal$/);
  await patient.getByLabel("Private access token").fill(created.manual_token);
  await patient
    .getByRole("button", { name: "Open encounter", exact: true })
    .click();
  await expect(
    patient.getByRole("heading", { name: "About you", exact: true }),
  ).toBeVisible();
  await patient
    .getByLabel("Name", { exact: true })
    .fill("Synthetic adaptive patient");
  await patient.getByRole("button", { name: "Save & continue" }).click();
  await patient
    .getByLabel("What is your main concern?")
    .fill("Synthetic fever acceptance report");
  await patient.getByRole("checkbox", { name: "fever", exact: true }).check();
  await patient.getByLabel("I have reviewed the symptom list.").check();
  await patient.getByLabel("When did it start?").fill("SYNTHETIC-ACCEPTANCE");
  await patient.getByLabel("How has it changed?").selectOption("same");
  await patient.getByRole("button", { name: "Save & continue" }).click();
  await expect(
    patient.getByLabel("How long have you had a fever?"),
  ).toBeVisible();
  await expect(patient.getByLabel("Where is the bleeding?")).toHaveCount(0);
  await patient
    .getByLabel("How long have you had a fever?")
    .fill("Synthetic duration");
  await patient
    .getByRole("button", { name: "Save draft", exact: true })
    .click();
  await expect(patient.getByRole("status")).toContainText("Draft saved");
  await patient.reload();
  await expect(
    patient.getByLabel("How long have you had a fever?"),
  ).toHaveValue("Synthetic duration");
  await patient.getByLabel("Language", { exact: true }).selectOption("kn");
  await expect(
    patient.getByRole("heading", { name: "ಲಕ್ಷಣಗಳ ವಿವರಗಳು" }),
  ).toBeVisible();
  await patient.getByLabel("Language", { exact: true }).selectOption("hi");
  await expect(
    patient.getByRole("heading", { name: "लक्षणों का विवरण" }),
  ).toBeVisible();
  await patient.getByLabel("Language", { exact: true }).selectOption("en");
  await patient.getByRole("button", { name: "Save & continue" }).click();
  await patient.getByLabel("Known medical conditions").selectOption("recorded");
  await patient
    .getByRole("checkbox", { name: "diabetes", exact: true })
    .check();
  await patient.getByRole("button", { name: "Save & continue" }).click();
  await patient.getByLabel("Medicines you take").selectOption("recorded");
  await patient
    .getByRole("button", { name: "Add medicine", exact: true })
    .click();
  await patient.getByLabel("name", { exact: true }).fill("Synthetic medicine");
  await patient.getByLabel("dose", { exact: true }).fill("Synthetic dose");
  await patient.getByRole("button", { name: "Save & continue" }).click();
  await patient.getByLabel("Known allergies").selectOption("recorded");
  await patient
    .getByRole("button", { name: "Add allergy", exact: true })
    .click();
  await patient
    .getByLabel("Substance", { exact: true })
    .fill("Synthetic allergy");
  await patient
    .getByLabel("Reaction", { exact: true })
    .fill("Synthetic reaction");
  await patient.getByRole("button", { name: "Save & continue" }).click();
  await patient.getByRole("button", { name: "Save & continue" }).click();
  await expect(patient.getByText("Synthetic medicine").first()).toBeVisible();
  await patient.getByLabel("I reviewed my answers and consent").check();
  await patient
    .getByRole("button", { name: "Send to care team", exact: true })
    .click();
  await expect(
    patient.getByRole("heading", { name: "GREEN — non-immediate care" }),
  ).toBeVisible();
  await expect(patient.getByRole("status")).toContainText("Report recorded");
  await page.goto(`/encounters/${created.id}`);
  await expect(
    page.getByRole("heading", { name: "Patient medical brief" }),
  ).toBeVisible();
  await expect(
    page.getByText("Synthetic medicine", { exact: false }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Synthetic allergy", { exact: false }).first(),
  ).toBeVisible();
  await patient
    .getByRole("button", { name: "MY SYMPTOMS HAVE CHANGED" })
    .click();
  await patient.getByLabel("How has it changed?").selectOption("worsening");
  for (let i = 1; i < 7; i++)
    await patient.getByRole("button", { name: "Save & continue" }).click();
  await patient.getByLabel("I reviewed my answers and consent").check();
  await patient
    .getByRole("button", { name: "Send to care team", exact: true })
    .click();
  await expect(
    patient.getByRole("heading", { name: "YELLOW — prompt assessment" }),
  ).toBeVisible();
  await page.bringToFront();
  await expect(
    page.getByRole("heading", { name: "Preliminary assessment: YELLOW" }),
  ).toBeVisible({ timeout: 35000 });
  await patient
    .getByRole("button", { name: "Notify staff: I need immediate help" })
    .click();
  await expect(
    patient.getByRole("heading", { name: "RED — emergency assistance" }),
  ).toBeVisible();
  await page.bringToFront();
  await expect(
    page.getByRole("heading", { name: "Preliminary assessment: RED" }),
  ).toBeVisible({ timeout: 35000 });
  await patient.setViewportSize({ width: 390, height: 844 });
  expect(
    await patient.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const accessibility = await new AxeBuilder({ page: patient }).analyze();
  expect(
    accessibility.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await patient.screenshot({
    path: "output/playwright/adaptive-patient-mobile.png",
    fullPage: true,
  });
  await patient.getByRole("button", { name: "Close private session" }).click();
  await expect(patient.getByRole("status")).toContainText(
    "Patient session closed on this device.",
  );
  await expect(patient.getByLabel("Private access token")).toBeVisible();
  const closed = await patient.request.post("/api/patient/session", {
    headers: { origin: baseURL! },
    data: { action: "status" },
  });
  expect(closed.status()).toBe(401);
  await patientContext.close();
});
test("doctor registration is absent and server routes/actions reject it", async ({
  page,
  baseURL,
}) => {
  await page.goto(await login(page, "doctor"));
  await expect(
    page.getByRole("link", { name: "Register patient", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Open navigation: Workspace" })
    .click();
  await expect(
    page.getByRole("link", { name: "Patient registration", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  const denied = await page.request.get("/registration");
  expect(denied.status()).toBe(403);
  const data = await (await page.request.get("/api/snapshot")).json();
  const response = await page.request.post("/api/command", {
    headers: { origin: baseURL! },
    data: {
      hospital: data.hospital.id,
      action: "register",
      data: {
        operation_id: crypto.randomUUID(),
        name: "Forbidden synthetic registration",
      },
    },
  });
  expect(response.status()).toBe(403);
});
test("administrator directory and sticky resource sidebar contain operational data only", async ({
  page,
}) => {
  await page.goto(await login(page, "admin"));
  await expect(
    page.getByRole("heading", { name: "Patient directory", exact: true }),
  ).toBeVisible();
  const snapshot = await (await page.request.get("/api/snapshot")).json();
  expect(snapshot.patientReports).toEqual([]);
  expect(snapshot.notes).toEqual([]);
  expect(
    snapshot.encounters.every((e: { symptoms: string }) => e.symptoms === ""),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 500));
  const sidebar = page.locator(".resource-sidebar");
  await expect(sidebar).toBeVisible();
  const bounds = await sidebar.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeLessThan(200);
  await page.screenshot({
    path: "output/playwright/admin-directory.png",
    fullPage: true,
  });
  await sidebar.getByRole("link", { name: "Manage resources" }).click();
  await expect(
    page.getByRole("heading", { name: "Resource inventory" }),
  ).toBeVisible();
  await expect(page.locator(".resource-sidebar")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("administrator provisions real synthetic staff and resource inventory; clinical roles cannot provision", async ({
  page,
  baseURL,
}) => {
  await login(page, "admin");
  await page.goto("/staff");
  await page
    .getByText("Create a synthetic staff account", { exact: true })
    .click();
  const name = `Synthetic staff ${Date.now()}`;
  await page.getByLabel("Display name", { exact: true }).fill(name);
  await page.getByLabel("Staff email").fill(`local-${Date.now()}@example.test`);
  await page
    .getByLabel("Initial password")
    .fill(`Synthetic-only-${crypto.randomUUID()}`);
  await page
    .getByRole("button", { name: "Create account and membership" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Staff account and membership created",
  );
  await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
  await page.goto("/resources");
  await page.getByText("Add and manage equipment", { exact: true }).click();
  const resourceName = `Synthetic UI wheelchair ${Date.now()}`;
  await page.getByLabel("Resource name", { exact: true }).fill(resourceName);
  await page
    .getByLabel("Resource location", { exact: true })
    .fill("Synthetic outpatient desk");
  await page
    .getByLabel("Resource type", { exact: true })
    .selectOption("Wheelchair");
  await page
    .getByRole("button", { name: "Add equipment", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: resourceName }),
  ).toContainText("AVAILABLE");
  const snapshot = await (await page.request.get("/api/snapshot")).json();
  await login(page, "doctor");
  const denied = await page.request.post("/api/staff", {
    headers: { origin: baseURL! },
    data: {
      hospital: snapshot.hospital.id,
      email: `denied-${Date.now()}@example.test`,
      password: `Synthetic-${crypto.randomUUID()}`,
      display_name: "Synthetic forbidden account",
      role: "nurse",
      operation_id: crypto.randomUUID(),
    },
  });
  expect(denied.status()).toBe(403);
});
