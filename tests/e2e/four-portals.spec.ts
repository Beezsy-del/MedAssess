import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("login exposes four portals with accessible mobile patient entry", async ({
  page,
}) => {
  await page.goto("/login");
  const choices = page.getByRole("region", { name: "Choose your portal" });
  await expect(choices.locator("article")).toHaveCount(4);
  for (const name of [
    "Administrator Portal",
    "Doctor Portal",
    "Triage Nurse Portal",
    "PATIENT PORTAL",
  ]) {
    await expect(
      choices.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  await page.screenshot({
    path: "output/playwright/four-portals-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page }).analyze();
  expect(
    audit.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await choices.getByRole("link", { name: "Enter Patient Portal" }).click();
  await expect(page).toHaveURL(/\/patient-portal$/);
  await expect(
    page.getByRole("heading", { name: "Scan your QR code" }),
  ).toBeVisible();
  await expect(page.getByLabel("Private access token")).toBeVisible();
  await expect(
    page.getByText("No pass or need help?", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Staff access" })).toHaveCount(0);
  await page.getByLabel("Language", { exact: true }).selectOption("kn");
  await expect(
    page.getByRole("heading", { name: "ನಿಮ್ಮ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ" }),
  ).toBeVisible();
  await page.screenshot({
    path: "output/playwright/patient-entry-mobile.png",
    fullPage: true,
  });
});

test("new patient route opens QR fragment for the correct encounter and rejects a guessed token", async ({
  page,
  browser,
  baseURL,
}) => {
  const headers = { origin: baseURL! };
  expect(
    (
      await page.request.post("/api/auth", {
        headers,
        data: { action: "demo", role: "nurse" },
      })
    ).ok(),
  ).toBe(true);
  const snapshot = await (await page.request.get("/api/snapshot")).json();
  const create = await page.request.post("/api/command", {
    headers,
    data: {
      hospital: snapshot.hospital.id,
      action: "register",
      data: {
        operation_id: crypto.randomUUID(),
        name: `Synthetic four-portal QR ${Date.now()}`,
      },
    },
  });
  expect(create.ok()).toBe(true);
  const created = await create.json();
  const context = await browser.newContext({ baseURL });
  try {
    const patient = await context.newPage();
    await patient.goto(`/patient-portal#${created.token}`);
    await expect(
      patient.getByRole("heading", { name: "About you", exact: true }),
    ).toBeVisible();
    expect(new URL(patient.url()).hash).toBe("");
    const qr = await (
      await context.request.post("/api/patient/session", {
        headers,
        data: { action: "status" },
      })
    ).json();
    await context.request.post("/api/patient/session", {
      headers,
      data: { action: "logout" },
    });
    const manual = await context.request.post("/api/patient/session", {
      headers,
      data: { action: "open", token: created.manual_token },
    });
    expect(manual.ok()).toBe(true);
    expect((await manual.json()).reference).toBe(qr.reference);
    const guess = await context.request.post("/api/patient/session", {
      headers,
      data: { action: "open", token: "0".repeat(32) },
    });
    expect(guess.ok()).toBe(false);
    expect(
      (
        await context.request.post("/api/patient/session", {
          headers,
          data: { action: "status" },
        })
      ).status(),
    ).toBe(401);
  } finally {
    await context.close();
  }
});
