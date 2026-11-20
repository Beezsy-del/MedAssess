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
test("staff demo, persisted registration, assessment and discharge", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Doctor", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hospital overview" }),
  ).toBeVisible();
  await page.screenshot({
    path: "output/playwright/dashboard-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Register patient", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Register patient", exact: true })
    .click();
  const name = `Synthetic E2E ${Date.now()}`;
  await page.getByLabel("Full name", { exact: true }).fill(name);
  await page.getByLabel("Age (if known)").fill("35");
  await page
    .getByLabel("Presenting complaint")
    .fill("Synthetic mild ankle discomfort");
  await page.getByRole("button", { name: "Create encounter & QR" }).click();
  await expect(
    page.getByRole("heading", { name: "Encounter created" }),
  ).toBeVisible();
  const href = await page
    .getByRole("link", { name: "Open intake" })
    .getAttribute("href");
  expect(href).toContain("/patient/intake/");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("link", { name: new RegExp(name) })
    .first()
    .click();
  for (const [button, reason] of [
    ["Report deterioration", "Synthetic worsening observations require review"],
    ["Record resource shortage", "Synthetic shortage reviewed by coordinator"],
  ]) {
    await page.getByRole("button", { name: button, exact: true }).click();
    await page.getByLabel("Reason / instructions").fill(reason);
    await page.getByRole("button", { name: "Save to encounter" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(reason, { exact: true }).first()).toBeVisible();
  }
  await page.getByRole("button", { name: "Assess patient" }).click();
  await page.getByLabel("I have performed a human clinical assessment").check();
  await page.getByLabel("Clinician-confirmed category").selectOption("GREEN");
  await page
    .getByLabel("Clinical reasoning / reason for override")
    .fill(
      "Synthetic clinician assessment completed; non-immediate category confirmed for software testing.",
    );
  await page.getByRole("button", { name: "Save clinical assessment" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  for (const status of [
    "WAITING",
    "STAFF_ASSIGNED",
    "ASSESSMENT",
    "TREATMENT",
    "DISPOSITION",
    "DISCHARGED",
  ]) {
    await page.getByRole("button", { name: "Update patient flow" }).click();
    await page.getByLabel("Next status").selectOption(status);
    if (status === "STAFF_ASSIGNED")
      await page
        .getByLabel("Assign clinician")
        .selectOption({ label: "Dr. Ananya Rao" });
    await page
      .getByLabel("Handover / disposition")
      .fill(
        "Synthetic handover and discharge instructions documented. Follow up with staff if symptoms worsen.",
      );
    await page.getByRole("button", { name: "Save to encounter" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await expect(
    page.getByText("discharged", { exact: true }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("discharged", { exact: true }).first(),
  ).toBeVisible();
});
test("patient emergency bypasses intake; secure status and language controls", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Triage nurse", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hospital overview" }),
  ).toBeVisible();
  await page.goto("/reception");
  await page
    .getByRole("button", { name: "Register patient", exact: true })
    .click();
  await page
    .getByLabel("Full name", { exact: true })
    .fill(`Synthetic portal ${Date.now()}`);
  await page.getByRole("button", { name: "Create encounter & QR" }).click();
  await expect(
    page.getByRole("heading", { name: "Encounter created" }),
  ).toBeVisible();
  const href = await page
    .getByRole("link", { name: "Open intake" })
    .getAttribute("href");
  const patient = await context.newPage();
  await patient.goto(href!);
  await expect(
    patient.getByRole("heading", { name: "Your care starts here" }),
  ).toBeVisible();
  await patient.getByLabel("Language", { exact: true }).selectOption("hi");
  await expect(
    patient.getByRole("heading", { name: "आपकी देखभाल यहाँ शुरू होती है" }),
  ).toBeVisible();
  await patient.getByLabel("भाषा", { exact: true }).selectOption("en");
  await patient
    .getByRole("button", { name: "Request immediate staff assistance" })
    .click();
  await expect(patient.getByRole("status")).toContainText(
    "Assistance request recorded",
  );
  await patient
    .getByLabel("What is troubling you?")
    .fill("Synthetic severe breathing difficulty");
  await patient.getByLabel("I understand this information").check();
  await patient.getByRole("button", { name: "Send to care team" }).click();
  await expect(
    patient.getByRole("heading", {
      name: "Your information has been received",
    }),
  ).toBeVisible();
  await patient.setViewportSize({ width: 390, height: 844 });
  await patient.screenshot({
    path: "output/playwright/patient-mobile.png",
    fullPage: true,
  });
  expect(
    await patient.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("offline draft persists and syncs once on reconnect", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Triage nurse", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hospital overview" }),
  ).toBeVisible();
  await page.goto("/reception");
  await expect(
    page.getByRole("heading", { name: "Reception", exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Register patient", exact: true })
    .click();
  await page
    .getByLabel("Full name", { exact: true })
    .fill(`Synthetic offline ${Date.now()}`);
  await page.getByRole("button", { name: "Save offline registration" }).click();
  await expect(
    page.getByText("1 drafts on this device.", { exact: false }),
  ).toBeVisible();
  const stored = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("medcipher-device-capture", 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return new Promise<{ encrypted: boolean; plaintext: boolean }>(
      (resolve) => {
        const request = db.transaction("outbox").objectStore("outbox").getAll();
        request.onsuccess = () => {
          const row = request.result[0];
          resolve({
            encrypted: row.ciphertext instanceof ArrayBuffer,
            plaintext: "data" in row,
          });
          db.close();
        };
      },
    );
  });
  expect(stored).toEqual({ encrypted: true, plaintext: false });
  await page.route("**/api/command", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"Synthetic provider outage"}',
    }),
  );
  await context.setOffline(false);
  await expect(
    page
      .getByText(
        "Synchronization failed. Draft retained; retry when connected.",
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.getByText("1 drafts on this device.", { exact: false }),
  ).toBeVisible();
  await page.unroute("**/api/command");
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(
    page.getByText("0 drafts on this device.", { exact: false }),
  ).toBeVisible({ timeout: 30000 });
});
test("keyboard and responsive dashboard has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Doctor", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hospital overview" }),
  ).toBeVisible();
  const desktop = await new AxeBuilder({ page }).analyze();
  expect(
    desktop.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => ({
        fits: document.documentElement.scrollWidth <= window.innerWidth,
        width: window.innerWidth,
        scroll: document.documentElement.scrollWidth,
      })),
    ).toMatchObject({ fits: true, width });
  }
  await page.screenshot({
    path: "output/playwright/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("link", { name: "SmartFlow", exact: true }),
  ).toBeVisible();
});
test("unauthenticated staff routes redirect and public emergency guidance stays available", async ({
  page,
  request,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
  await page.goto("/emergency");
  await expect(
    page.getByRole("heading", { name: "Get help from hospital staff now." }),
  ).toBeVisible();
  const response = await request.post("/api/command", {
    data: {
      hospital: crypto.randomUUID(),
      action: "register",
      data: { operation_id: crypto.randomUUID() },
    },
    headers: {
      Origin: new URL(page.url()).origin,
      ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
        ? {
            "x-vercel-protection-bypass":
              process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
          }
        : {}),
    },
  });
  expect(response.status()).toBe(403);
});

test("hospital selection enforces membership and survives navigation", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Doctor", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hospital overview" }),
  ).toBeVisible();
  const result = await page.evaluate(async () => {
    const initial = await fetch("/api/snapshot").then((r) => r.json());
    const select = await fetch("/api/hospital", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospital: initial.hospital.id }),
    });
    const foreign = "99999999-9999-4999-8999-999999999999";
    const denied = await fetch(`/api/snapshot?hospital=${foreign}`);
    const deniedSwitch = await fetch("/api/hospital", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospital: foreign }),
    });
    return {
      selected: select.status,
      denied: denied.status,
      deniedSwitch: deniedSwitch.status,
      hospital: initial.hospital.id,
    };
  });
  expect(result.selected).toBe(200);
  expect(result.denied).toBe(403);
  expect(result.deniedSwitch).toBe(403);
  await page.goto("/doctor");
  await expect(
    page.getByRole("heading", { name: "Clinical workspace" }),
  ).toBeVisible();
  await page.getByLabel("Filter assignment").selectOption("mine");
  const expected = await page.evaluate(async () => {
    const data = await fetch("/api/snapshot").then((r) => r.json());
    return {
      hospital: data.hospital.id,
      mine: data.encounters.filter(
        (e: { assigned_to: string | null; status: string }) =>
          e.assigned_to === data.userId &&
          !["DISCHARGED", "TRANSFERRED", "CANCELLED", "ADMITTED"].includes(
            e.status,
          ),
      ).length,
    };
  });
  expect(expected.hospital).toBe(result.hospital);
  await expect(
    page.getByText(
      `${expected.mine} encounters · Clinical urgency always comes first`,
    ),
  ).toBeVisible();
  await page.getByLabel("Filter assignment").selectOption("unassigned");
  await expect(page.getByLabel("Filter assignment")).toHaveValue("unassigned");
});

test("failed refresh and logout report errors without claiming success", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Doctor", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hospital overview" }),
  ).toBeVisible();
  await page.route("**/api/snapshot?*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"Synthetic database outage"}',
    }),
  );
  await page.getByRole("button", { name: "Refresh data", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Refresh failed");
  await expect(
    page.getByRole("heading", { name: "Hospital overview" }),
  ).toBeVisible();
  await page.route("**/api/auth", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"Synthetic authentication outage"}',
    }),
  );
  await page
    .getByRole("button", { name: "Log out and clear local drafts" })
    .click();
  await expect(page.getByRole("status")).toContainText("Sign-out failed");
  await expect(page).toHaveURL(/dashboard/);
});
