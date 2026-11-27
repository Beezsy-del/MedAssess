import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
const base = process.env.BASE_URL;
if (!base) throw new Error("Set BASE_URL for the deployment to verify");
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
});
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.name));
try {
  if (process.env.PREVIEW_ACCESS_FILE)
    await page.goto(
      readFileSync(process.env.PREVIEW_ACCESS_FILE, "utf8").trim(),
    );
  await page.goto(`${base}/login`);
  assert.equal(await page.locator(".portal-option").count(), 4);
  await page
    .getByRole("link", { name: "Enter Patient Portal", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Real Patient Access", exact: true })
    .waitFor();
  await page
    .getByRole("link", { name: "Explore Demo Mode", exact: true })
    .click();
  await page
    .getByText(
      "DEMO MODE — SYNTHETIC PATIENT DATA — NOT FOR REAL CLINICAL USE",
      { exact: true },
    )
    .waitFor();
  console.log("PASS four portal options and token-free demo");
  await page.goto(`${base}/patient/start`);
  await page.getByRole("heading", { name: "Scan your QR code" }).waitFor();
  console.log("PASS real patient access still requires a credential");
  for (const [role, heading, route] of [
    ["nurse", "Nursing workspace", "/nurse"],
    ["doctor", "Clinical workspace", "/doctor"],
    ["admin", "Patient directory", "/patients"],
  ]) {
    const login = await context.request.post(`${base}/api/auth`, {
      headers: { origin: base },
      data: { action: "demo", role },
    });
    assert.equal(login.status(), 200, `${role} sign-in`);
    await page.goto(`${base}${route}`);
    await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    if (role === "doctor")
      assert.equal(
        await page
          .getByRole("link", { name: "Register patient", exact: true })
          .count(),
        0,
      );
    if (role === "admin") {
      await page.goto(`${base}/staff`);
      await page
        .getByRole("heading", { name: "Staff access", exact: true })
        .waitFor();
      await page.goto(`${base}/resources`);
      await page
        .getByRole("heading", { name: "Resource inventory", exact: true })
        .waitFor();
    }
    console.log(`PASS ${role} hosted sign-in and authorized workspace`);
  }
  assert.deepEqual(errors, []);
  console.log("PASS no browser runtime exceptions observed");
} finally {
  await browser.close();
}
