import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function nurse(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Triage nurse", exact: true }).click();
  await expect(page).toHaveURL(/\/registration$/);
  await expect(
    page.getByRole("heading", { name: "Patient registration", exact: true }),
  ).toBeVisible();
}
async function identify(page: Page, name: string) {
  await page.getByLabel("Full name", { exact: true }).fill(name);
  await page
    .getByLabel("I verified the patient's identity", { exact: false })
    .check();
  await page.getByRole("button", { name: "Continue to assessment" }).click();
}
async function assessment(page: Page) {
  await page
    .getByLabel("Symptoms / current observations")
    .fill("Synthetic ankle pain; nurse assessed");
  await page.getByLabel("Pulse / min", { exact: true }).fill("80");
  await page
    .getByLabel("I have performed a human clinical assessment", {
      exact: false,
    })
    .check();
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await page
    .getByRole("radio", { name: "YELLOW — Urgent assessment", exact: false })
    .check();
  await page
    .getByLabel("Clinical justification / reason for override")
    .fill("Synthetic nurse confirmation after assessment");
  await page
    .getByRole("button", { name: "Review assignment", exact: true })
    .click();
  await page
    .getByLabel("I confirm this patient, encounter and triage assignment.")
    .check();
}
test("nurse registers, assesses and confirms in one transaction; next patient and existing lookup", async ({
  page,
}) => {
  await nurse(page);
  const name = `Synthetic nursing browser ${Date.now()}`;
  await identify(page, name);
  await assessment(page);
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/command") &&
      r.request().postDataJSON().action === "intake",
  );
  await page
    .getByRole("button", { name: "Confirm registration & triage" })
    .click();
  const saved = await (await response).json();
  await expect(
    page.getByRole("heading", { name: "Registration and triage saved" }),
  ).toBeVisible();
  expect(saved.category).toBe("YELLOW");
  expect(saved.status).toBe("WAITING");
  await expect(
    page.getByRole("region", { name: "Registration confirmation" }),
  ).toContainText(name);
  await page.getByRole("link", { name: "View encounter details" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(
    page.getByText("Synthetic nurse confirmation after assessment").first(),
  ).toBeVisible();
  await page.goto("/registration");
  await page
    .getByRole("button", { name: "Find existing patient", exact: false })
    .click();
  await page
    .getByLabel("Search by patient ID, MRN, name, date of birth or phone")
    .fill(saved.patient_id);
  await expect(
    page.getByRole("region", { name: "Matching patient records" }),
  ).toContainText(name);
  await page
    .getByRole("button", { name: "Select patient", exact: true })
    .click();
  await expect(
    page.getByText("This patient has an active visit"),
  ).toBeVisible();
  await page
    .getByLabel("Reason for a separate new encounter")
    .fill("Separate synthetic follow-up visit");
  await page
    .getByLabel("I verified the patient's identity", { exact: false })
    .check();
  await page.getByRole("button", { name: "Continue to assessment" }).click();
  await assessment(page);
  await page
    .getByRole("button", { name: "Confirm registration & triage" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Registration and triage saved" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Register another patient" }).click();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("");
});
test("draft resumes, backend failure preserves entries, safe retry and tablet accessibility", async ({
  page,
  context,
}) => {
  await nurse(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  const name = `Synthetic draft intake ${Date.now()}`;
  await identify(page, name);
  await page
    .getByLabel("Symptoms / current observations")
    .fill("Synthetic preserved observation");
  await context.setOffline(true);
  await page.getByRole("button", { name: "Save device draft" }).click();
  await expect(
    page.getByText("Draft saved on this device.", { exact: false }),
  ).toBeVisible();
  await context.setOffline(false);
  await expect
    .poll(() =>
      page.evaluate(() =>
        fetch("/api/snapshot")
          .then((r) => r.status)
          .catch(() => 0),
      ),
    )
    .toBe(200);
  await page.reload();
  if (await page.getByRole("heading", { name: "You’re offline." }).isVisible())
    await page.getByRole("button", { name: "Try reconnecting" }).click();
  await expect(
    page.getByRole("heading", { name: "Patient registration", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Resume draft", exact: true })
    .last()
    .click();
  await expect(page.getByLabel("Symptoms / current observations")).toHaveValue(
    "Synthetic preserved observation",
  );
  await assessment(page);
  await page.route("**/api/command", (route) =>
    route.request().postDataJSON().action === "intake"
      ? route.fulfill({
          status: 503,
          json: { error: "Synthetic intake outage" },
        })
      : route.continue(),
  );
  await page
    .getByRole("button", { name: "Confirm registration & triage" })
    .click();
  await expect(
    page.getByRole("button", { name: "Retry confirmation" }),
  ).toBeVisible();
  await expect(page.locator(".intake-review")).toContainText(name);
  await page.unroute("**/api/command");
  await page.getByRole("button", { name: "Retry confirmation" }).click();
  await expect(
    page.getByRole("heading", { name: "Registration and triage saved" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Register another patient" }).click();
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1024 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  const axe = await new AxeBuilder({ page }).analyze();
  expect(
    axe.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});
test("duplicate identity is stopped without losing form and roles retain their landing pages", async ({
  page,
}) => {
  await nurse(page);
  const snapshot = await page.request.get("/api/snapshot");
  const data = await snapshot.json();
  const existing = data.patients.find(
    (p: { unidentified: boolean; name: string }) =>
      !p.unidentified && p.name.startsWith("Synthetic"),
  );
  await identify(page, existing.name);
  await assessment(page);
  const attempted = page.waitForRequest(
    (r) =>
      r.url().endsWith("/api/command") && r.postDataJSON().action === "intake",
  );
  await page
    .getByRole("button", { name: "Confirm registration & triage" })
    .click();
  await expect(page.locator(".intake-form").getByRole("alert")).toContainText(
    "Possible existing patient",
  );
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByLabel("Clinical justification / reason for override"),
  ).toHaveValue("Synthetic nurse confirmation after assessment");
  page.on("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Log out and clear local drafts" })
    .click();
  await page
    .getByRole("button", { name: "Administrator", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/registration");
  await expect(
    page.getByRole("heading", { name: "Clinical intake access required" }),
  ).toBeVisible();
  const denied = await page.request.post("/api/command", {
    headers: { origin: new URL(page.url()).origin },
    data: {
      hospital: data.hospital.id,
      action: "intake",
      data: (await attempted).postDataJSON().data,
    },
  });
  expect(denied.status()).toBe(403);
  const administrative = await (await page.request.get("/api/snapshot")).json();
  expect(
    administrative.audit.some(
      (event: { action: string; actor: string }) =>
        event.action === "intake.confirmed" && event.actor,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Log out and clear local drafts" })
    .click();
  await page.getByRole("button", { name: "Doctor", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hospital overview" }),
  ).toBeVisible();
});

test("pending encounter resumes and a lost acknowledgement retries without another assessment", async ({
  page,
}) => {
  await nurse(page);
  const snapshot = await (await page.request.get("/api/snapshot")).json();
  const name = `Synthetic resume browser ${Date.now()}`;
  const response = await page.request.post("/api/command", {
    headers: { origin: new URL(page.url()).origin },
    data: {
      hospital: snapshot.hospital.id,
      action: "register",
      data: { operation_id: crypto.randomUUID(), name },
    },
  });
  expect(response.ok()).toBe(true);
  const created = await response.json();
  await page.reload();
  await page
    .getByRole("button", { name: "Awaiting assessment", exact: true })
    .click();
  await page
    .locator(".intake-resume")
    .filter({ hasText: name })
    .getByRole("button", { name: "Assess in registration" })
    .click();
  await page
    .getByLabel("I verified the patient's identity", { exact: false })
    .check();
  await page.getByRole("button", { name: "Continue to assessment" }).click();
  await assessment(page);
  let committedId = "";
  await page.route("**/api/command", async (route) => {
    if (route.request().postDataJSON().action !== "intake")
      return route.continue();
    const actual = await route.fetch();
    expect(actual.ok()).toBe(true);
    committedId = (await actual.json()).id;
    await route.fulfill({
      status: 503,
      json: { error: "Synthetic lost acknowledgement after commit" },
    });
  });
  await page
    .getByRole("button", { name: "Confirm registration & triage" })
    .click();
  await expect(
    page.getByRole("button", { name: "Retry confirmation" }),
  ).toBeVisible();
  expect(committedId).toBe(created.id);
  await page.unroute("**/api/command");
  await page.getByRole("button", { name: "Retry confirmation" }).click();
  await expect(
    page.getByRole("heading", { name: "Registration and triage saved" }),
  ).toBeVisible();
  const verified = await (await page.request.get("/api/snapshot")).json();
  expect(
    verified.assessments.filter(
      (a: { encounter_id: string }) => a.encounter_id === created.id,
    ),
  ).toHaveLength(1);
  expect(
    verified.encounters.filter((e: { id: string }) => e.id === created.id),
  ).toHaveLength(1);
  await page.getByRole("button", { name: "Register another patient" }).click();
  await page
    .getByLabel("Unidentified emergency patient / details unavailable")
    .check();
  await page
    .getByLabel(
      "I confirm this is a temporary record for an unidentified patient.",
    )
    .check();
  await page.getByRole("button", { name: "Continue to assessment" }).click();
  await page
    .getByRole("radio", { name: "Assessment incomplete", exact: false })
    .check();
  await page
    .getByLabel("Clinical justification / reason for override")
    .fill("Synthetic unidentified patient; observations not yet available");
  await page
    .getByRole("button", { name: "Review assignment", exact: true })
    .click();
  await page
    .getByLabel("I confirm this patient, encounter and triage assignment.")
    .check();
  await page
    .getByRole("button", { name: "Confirm registration & triage" })
    .click();
  await expect(
    page.getByRole("region", { name: "Registration confirmation" }),
  ).toContainText("awaiting assessment");
});
