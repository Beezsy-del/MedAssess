import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function signIn(page: Page, role = "Triage nurse") {
  await page.goto("/login");
  await page.getByRole("button", { name: role, exact: true }).click();
  await expect(page).toHaveURL(
    role === "Triage nurse"
      ? /\/nurse$/
      : role === "Doctor"
        ? /\/doctor$/
        : /\/dashboard$/,
  );
}
test("intake opens physical bed map; reviewed compatible allocation updates another session and releases through cleaning", async ({
  page,
  browser,
}) => {
  await signIn(page);
  await page.goto("/registration");
  const name = `Synthetic bed browser ${Date.now()}`;
  await page.getByLabel("Full name", { exact: true }).fill(name);
  await page
    .getByLabel("I verified the patient's identity", { exact: false })
    .check();
  await page.getByRole("button", { name: "Continue to assessment" }).click();
  await page
    .getByLabel("Symptoms / current observations")
    .fill("Synthetic bed placement test");
  await page
    .getByLabel("I have performed a human clinical assessment", {
      exact: false,
    })
    .check();
  await page
    .getByRole("radio", { name: "YELLOW — Urgent assessment", exact: false })
    .check();
  await page
    .getByLabel("Clinical justification / reason for override")
    .fill("Synthetic nurse assessment for bed workflow");
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
    page.getByRole("heading", { name: "Choose the next care destination" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Critical care zone", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "High acuity zone", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Placement decision", exact: true })
    .selectOption("BED_REQUIRED");
  const ward = page.getByLabel("Clinically required ward / care level");
  // Hospitals can accept multiple urgency categories in the same physical ward.
  const highAcuity = ward.getByRole("option", { name: /^High acuity ·/ });
  await expect(highAcuity).toBeEnabled();
  await ward.selectOption((await highAcuity.getAttribute("value"))!);
  await page
    .getByRole("combobox", { name: "Required bed type", exact: true })
    .selectOption("Emergency bed");
  await page.getByRole("checkbox", { name: "oxygen", exact: true }).check();
  await page
    .getByLabel("Placement reasoning / destination")
    .fill("Synthetic patient requires oxygen and emergency ward");
  await page
    .getByLabel(
      "I reviewed care level, ward compatibility, monitoring, isolation and equipment needs.",
    )
    .check();
  await page.getByRole("button", { name: "Save placement review" }).click();
  const recommended = page
    .locator(".bed-recommendations")
    .getByRole("button")
    .first();
  await expect(recommended).toBeVisible();
  const bedName = (await recommended.innerText()).split(" · ")[0];
  await recommended.click();
  await page
    .getByLabel("Bed action reason")
    .fill("Synthetic bedside safety and equipment checks complete");
  await page
    .getByLabel(
      "I verified this patient, ward, required equipment and bed suitability.",
    )
    .check();
  const observer = await browser.newContext({
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE,
  });
  const other = await observer.newPage();
  await signIn(other, "Doctor");
  await other.goto("/resources");
  await expect(
    other.getByRole("button", {
      name: `${bedName} available — High acuity`,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Confirm bed allocation", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Bed occupied for the selected encounter." }),
  ).toBeVisible();
  await expect(
    other.getByRole("button", {
      name: `${bedName} occupied — High acuity`,
      exact: true,
    }),
  ).toBeVisible({ timeout: 45000 });
  await other
    .getByRole("button", {
      name: `${bedName} occupied — High acuity`,
      exact: true,
    })
    .click();
  await expect(
    other.getByRole("region", { name: "Selected bed details" }),
  ).toContainText(name);
  await expect(
    other.getByRole("button", { name: "Confirm bed allocation", exact: true }),
  ).toHaveCount(0);
  await observer.close();
  await page
    .getByLabel("Bed action reason")
    .fill("Synthetic transfer handover completed");
  await page.getByRole("button", { name: "Release bed for cleaning" }).click();
  await expect(page.locator(".bed-details")).toContainText("cleaning");
  await expect(
    page.getByRole("button", { name: "Confirm cleaned & available" }),
  ).toBeDisabled();
  await page
    .getByLabel("Cleaning, equipment and safety checks completed.")
    .check();
  await page
    .getByRole("button", { name: "Confirm cleaned & available" })
    .click();
  await expect(page.locator(".bed-details")).toContainText("available");
  await page.getByText("Edit placement requirements", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "Placement decision", exact: true })
    .selectOption("NO_BED");
  await page
    .getByLabel("Placement reasoning / destination")
    .fill("Synthetic clinician reviewed ambulatory destination");
  await page
    .getByLabel(
      "I reviewed care level, ward compatibility, monitoring, isolation and equipment needs.",
    )
    .check();
  await page.getByRole("button", { name: "Save placement review" }).click();
  await expect(page.locator(".bed-patient")).toContainText("no bed");
});
test("physical map preserves coordinates, supports keyboard and responsive themes; nurse cannot configure beds", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/registration");
  await page.goto("/resources");
  await expect(
    page.getByRole("heading", { name: "Hospital bed map" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Configure wards & beds" }),
  ).toHaveCount(0);
  const tile = page.locator(".bed-tile").first();
  await tile.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: "Selected bed details" }),
  ).toBeFocused();
  const before = await tile.getAttribute("style");
  await page
    .getByRole("combobox", { name: "Bed status", exact: true })
    .selectOption("AVAILABLE");
  await expect(tile).toHaveAttribute("style", before!);
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (t) => (document.documentElement.dataset.theme = t),
      theme,
    );
    await page.mouse.move(0, 0);
    await expect(
      page.getByRole("button", { name: "Refresh map", exact: true }),
    ).toHaveCSS(
      "background-color",
      theme === "dark" ? "rgb(17, 29, 48)" : "rgb(255, 255, 255)",
    );
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
  }
});

test("administrator configures bed capabilities and maintenance lifecycle but cannot approve clinical placement", async ({
  page,
}) => {
  await signIn(page, "Administrator");
  await page.goto("/resources");
  await page
    .getByText("Bed map, status and configuration", { exact: true })
    .click();
  const snapshot = await (await page.request.get("/api/snapshot")).json();
  const bed = snapshot.resources.find(
    (b: { kind: string; status: string }) =>
      b.kind === "ICU bed" && b.status === "AVAILABLE",
  );
  expect(bed).toBeTruthy();
  await page
    .getByRole("button", {
      name: `${bed.name} available — Critical care`,
      exact: true,
    })
    .click();
  await page
    .getByLabel("Bed action reason")
    .fill("Synthetic administrator maintenance inspection");
  await page
    .getByRole("button", { name: "Mark maintenance", exact: true })
    .click();
  await expect(page.locator(".bed-details")).toContainText("maintenance");
  await expect(
    page.getByRole("button", { name: "Confirm cleaned & available" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Send for turnover checks" }).click();
  await expect(page.locator(".bed-details")).toContainText("cleaning");
  await page
    .getByLabel("Cleaning, equipment and safety checks completed.")
    .check();
  await page
    .getByRole("button", { name: "Confirm cleaned & available" })
    .click();
  await expect(page.locator(".bed-details")).toContainText("available");
  await page.getByRole("button", { name: "Configure wards & beds" }).click();
  await page
    .getByLabel("I verified the ward, location and available capabilities.")
    .check();
  await page
    .getByLabel("Bed configuration reason", { exact: true })
    .fill("Synthetic administrator verified existing inventory");
  await page.getByRole("button", { name: "Save bed configuration" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Bed records saved." }),
  ).toBeVisible();
  const e = snapshot.encounters.find(
    (e: { status: string }) => e.status === "WAITING",
  );
  expect(e).toBeTruthy();
  const denied = await page.request.post("/api/command", {
    headers: { origin: new URL(page.url()).origin },
    data: {
      hospital: snapshot.hospital.id,
      action: "bed_plan",
      data: {
        operation_id: crypto.randomUUID(),
        encounter_id: e.id,
        version: e.version,
        decision: "NO_BED",
        ward_id: "",
        bed_kind: "",
        required_capabilities: [],
        reason: "Synthetic denied administrative clinical decision",
        reviewed: true,
      },
    },
  });
  expect(denied.status()).toBe(403);
});

test("lost placement acknowledgement keeps saved intake and retries the same operation", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/registration");
  const initial = await (await page.request.get("/api/snapshot")).json();
  const created = await page.request.post("/api/command", {
    headers: { origin: new URL(page.url()).origin },
    data: {
      hospital: initial.hospital.id,
      action: "register",
      data: {
        operation_id: crypto.randomUUID(),
        name: `Synthetic placement recovery ${Date.now()}`,
      },
    },
  });
  expect(created.ok()).toBe(true);
  const record = await created.json();
  await page.goto(`/beds/${record.id}`);
  await page
    .getByRole("combobox", { name: "Placement decision", exact: true })
    .selectOption("AWAITING");
  await page
    .getByLabel("Placement reasoning / destination")
    .fill("Synthetic incomplete observations; coordinate placement manually");
  await page
    .getByLabel(
      "I reviewed care level, ward compatibility, monitoring, isolation and equipment needs.",
    )
    .check();
  await page.route("**/api/command", async (route) => {
    if (route.request().postDataJSON().action !== "bed_plan")
      return route.continue();
    const response = await route.fetch();
    expect(response.ok()).toBe(true);
    await route.fulfill({
      status: 503,
      json: { error: "Synthetic lost acknowledgement" },
    });
  });
  await page.getByRole("button", { name: "Save placement review" }).click();
  await expect(
    page.getByRole("button", { name: "Retry bed operation" }),
  ).toBeVisible();
  await expect(page.locator(".bed-patient-identity")).toContainText(
    record.reference,
  );
  await page.unroute("**/api/command");
  await page.getByRole("button", { name: "Retry bed operation" }).click();
  await expect(
    page.getByRole("button", { name: "Retry bed operation" }),
  ).toHaveCount(0);
  const updated = await (await page.request.get("/api/snapshot")).json();
  expect(
    updated.bedPlans.find(
      (p: { encounter_id: string }) => p.encounter_id === record.id,
    ).decision,
  ).toBe("AWAITING");
  expect(
    updated.bedEvents.filter(
      (e: { encounter_id: string; action: string }) =>
        e.encounter_id === record.id && e.action === "bed_plan",
    ),
  ).toHaveLength(1);
});
