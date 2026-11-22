import { test, expect } from "@playwright/test";

test("individual staff can change credentials, retry network failures, and shared accounts are protected", async ({
  page,
  browser,
  baseURL,
}) => {
  const headers = { origin: baseURL! };
  expect(
    (
      await page.request.post("/api/auth", {
        headers,
        data: { action: "demo", role: "admin" },
      })
    ).ok(),
  ).toBe(true);
  const snapshot = await (await page.request.get("/api/snapshot")).json();
  const email = `synthetic-recovery-${crypto.randomUUID()}@example.test`;
  const password = `Synthetic-${crypto.randomUUID()}`;
  const replacement = `Synthetic-${crypto.randomUUID()}`;
  const created = await page.request.post("/api/staff", {
    headers,
    data: {
      hospital: snapshot.hospital.id,
      operation_id: crypto.randomUUID(),
      email,
      password,
      display_name: "Synthetic recovery verification",
      role: "nurse",
    },
  });
  expect(created.ok()).toBe(true);
  const { user_id } = await created.json();
  const context = await browser.newContext({ baseURL });
  try {
    expect(
      (
        await context.request.post("/api/auth", {
          headers,
          data: { action: "password", password: replacement },
        })
      ).status(),
    ).toBe(401);
    expect(
      (
        await context.request.post("/api/auth", {
          headers,
          data: { action: "login", email, password },
        })
      ).ok(),
    ).toBe(true);
    const account = await context.newPage();
    await account.goto("/update-password");
    await account.getByLabel("New password", { exact: true }).fill(replacement);
    await account.getByLabel("Confirm new password").fill(replacement);
    await account.route("**/api/auth", (route) => route.abort());
    await account
      .getByRole("button", { name: "Update password", exact: true })
      .click();
    await expect(account.getByRole("status")).not.toHaveText(
      "Password updated.",
    );
    await expect(
      account.getByRole("button", { name: "Update password", exact: true }),
    ).toBeEnabled();
    await account.unroute("**/api/auth");
    await account
      .getByRole("button", { name: "Update password", exact: true })
      .click();
    await expect(account.getByRole("status")).toHaveText("Password updated.");
    await context.request.post("/api/auth", {
      headers,
      data: { action: "logout" },
    });
    expect(
      (
        await context.request.post("/api/auth", {
          headers,
          data: { action: "login", email, password },
        })
      ).status(),
    ).toBe(401);
    expect(
      (
        await context.request.post("/api/auth", {
          headers,
          data: { action: "login", email, password: replacement },
        })
      ).ok(),
    ).toBe(true);
    expect(
      (
        await page.request.post("/api/auth", {
          headers,
          data: { action: "password", password: replacement },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await context.request.post("/api/auth", {
          headers: { origin: "https://invalid.example" },
          data: { action: "password", password },
        })
      ).status(),
    ).toBe(403);
  } finally {
    const disabled = await page.request.post("/api/command", {
      headers,
      data: {
        hospital: snapshot.hospital.id,
        action: "staff_access",
        data: {
          operation_id: crypto.randomUUID(),
          user_id,
          role: "nurse",
          active: false,
          reason: "Synthetic credential test complete",
        },
      },
    });
    expect(disabled.ok()).toBe(true);
    await context.close();
  }
});

test("patient reconnect clears stale warning and old status cannot reopen a closed session", async ({
  page,
  baseURL,
}) => {
  // Deterministic network scheduling tests the client race; database workflows are covered separately.
  let fail = false;
  let hold = false;
  let release!: () => void;
  let started!: () => void;
  const pending = new Promise<void>((resolve) => {
    started = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const status = {
    reference: "Synthetic reconnect",
    status: "WAITING",
    category: "ASSESSMENT_REQUIRED",
    closed: false,
    report_id: null,
  };
  await page.route("**/api/patient/session", async (route) => {
    const action = route.request().postDataJSON().action;
    if (action === "status" && hold) {
      started();
      await gate;
    }
    if (action === "status" && fail) return route.abort();
    await route.fulfill({ json: action === "logout" ? { ok: true } : status });
  });
  await page.goto(`${baseURL}/patient/start`);
  await expect(
    page.getByRole("heading", { name: "About you", exact: true }),
  ).toBeVisible();
  fail = true;
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "out of date",
  );
  await page.getByLabel("Language", { exact: true }).selectOption("hi");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "अपडेट उपलब्ध नहीं हैं",
  );
  await page.getByLabel("Language", { exact: true }).selectOption("en");
  fail = false;
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  hold = true;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await pending;
  await page.getByRole("button", { name: "Close private session" }).click();
  await expect(
    page.getByRole("heading", { name: "Open your patient pass" }),
  ).toBeVisible();
  const old = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/patient/session") &&
      r.request().postDataJSON().action === "status",
  );
  release();
  await old;
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await expect(
    page.getByRole("heading", { name: "Open your patient pass" }),
  ).toBeVisible();
  await expect(page.getByText("Synthetic reconnect")).toHaveCount(0);
});
