import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { CarePlan } from "../../lib/schema/care-plan";

const screenshotDir = "docs/judging/screenshots";
const comprehensiveCarePlan = JSON.parse(
  readFileSync(new URL("../fixtures/comprehensive-care-plan.json", import.meta.url), "utf8"),
) as CarePlan;

async function openDemo(page: Page) {
  await page.getByRole("button", { name: /Try the Comprehensive Sample/ }).click();
  await expect(page.getByRole("heading", { name: "Turning the document into a careful plan." })).toBeVisible();
  await expect(page.getByText("Preparing the deterministic fictional sample—no live AI call.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your next steps, organized from the discharge document" })).toBeVisible();
}

test("critical deterministic judging journey", async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}`));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Leave with a plan, not a pile of pages." })).toBeVisible();
  await expect(page.getByText("Source-linked", { exact: true })).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/landing-desktop.png`, fullPage: false });

  await openDemo(page);
  await expect(page.getByText("This is background about what happened in the hospital, not a new instruction for home.")).not.toBeVisible();
  await expect(page.locator('[data-medication-action="start"]')).toHaveCount(1);
  await expect(page.locator('[data-medication-action="unclear"]')).toHaveCount(1);
  await expect(page.getByTestId("conflict-card")).toContainText("ClearCare does not choose one");
  await expect(page.getByRole("heading", { name: "Diagnoses", exact: true })).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/dashboard-desktop.png`, fullPage: false });

  await page.getByRole("button", { name: "View source · p. 2, 3" }).click();
  const sourceDialog = page.getByRole("dialog", { name: "Change potassium chloride across two pages" });
  await expect(sourceDialog).toBeVisible();
  await expect(sourceDialog.locator("blockquote")).toContainText("CHANGE potassium chloride 10 mEq tablet");
  await expect(page.getByAltText("Fictional discharge document page 2")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("once daily for 5 days, then resume 10 mEq once daily.", { exact: true })).toBeVisible();
  await expect(page.getByAltText("Fictional discharge document page 3")).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/source-verification.png`, fullPage: false });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: "View source · p. 2, 3" })).toBeFocused();

  await page.getByRole("button", { name: /Exactly 1 lb in any week/ }).click();
  await expect(page.getByTestId("quiz-correction")).toContainText("Let’s check that against the source.");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page.getByRole("button", { name: /More than 2 lb in 24 hours/ }).click();
  await page.getByRole("button", { name: "Next question", exact: true }).click();
  await page.getByRole("button", { name: /Within 48 hours/ }).click();
  await page.getByRole("button", { name: "Next question", exact: true }).click();
  await page.getByRole("button", { name: /Use the rolling walker for all walking/ }).click();
  await page.getByRole("button", { name: "Next question", exact: true }).click();
  await page.getByRole("button", { name: /Confirm the unresolved difference/ }).click();
  await page.getByRole("button", { name: "Finish check", exact: true }).click();
  await expect(page.getByTestId("quiz-complete")).toContainText("You checked all 4 key instructions.");
  await page.screenshot({ path: `${screenshotDir}/teach-back-complete.png`, fullPage: false });

  await expect(page.getByTestId("print-control")).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByTestId("print-control")).toBeHidden();
  await expect(page.getByText("Source pages: 2, 3", { exact: true }).first()).toBeVisible();
  await expect(page.locator(".print-only h3").filter({ hasText: "Why the hospital stay happened" })).toBeVisible();
  await expect(page.getByText("ClearCare organizes and explains your uploaded instructions. It does not provide medical advice or replace your healthcare professional.", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/print-care-plan.png`, fullPage: true });
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Reset and clear", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Leave with a plan, not a pile of pages." })).toBeVisible();
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test("mobile and tablet layouts remain usable without overflow", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844, label: "mobile" },
    { width: 768, height: 1024, label: "tablet" },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Leave with a plan, not a pile of pages." })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (viewport.label === "mobile") {
      await page.screenshot({ path: `${screenshotDir}/landing-mobile.png`, fullPage: false });
    }
    await openDemo(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole("navigation", { name: "Care plan sections" })).toBeVisible();
    if (viewport.label === "mobile") {
      await page.screenshot({ path: `${screenshotDir}/dashboard-mobile.png`, fullPage: false });
    }
    await page.getByRole("button", { name: "Reset and clear", exact: true }).click();
  }
});

test("file validation and live-result lifecycle stay clear and local", async ({ page }) => {
  await page.addInitScript(() => {
    const originalRevokeObjectUrl = URL.revokeObjectURL.bind(URL);
    const trackedWindow = window as unknown as { __clearcareRevokedUrls: string[] };
    trackedWindow.__clearcareRevokedUrls = [];
    URL.revokeObjectURL = (url) => {
      trackedWindow.__clearcareRevokedUrls.push(url);
      originalRevokeObjectUrl(url);
    };
  });
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "unsafe.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("not an executable or medical document"),
  });
  await expect(page.locator("#file-error")).toHaveText("Choose a PDF, PNG, JPG, or JPEG file.");
  await expect(page.getByRole("button", { name: "Analyze this document" })).toHaveCount(0);

  const validFile = {
    name: "sample.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"),
  };
  await page.locator('input[type="file"]').setInputFiles(validFile);
  await expect(page.getByRole("button", { name: "Analyze this document" })).toBeVisible();
  await page.getByRole("button", { name: "Remove selected document" }).click();
  await page.locator('input[type="file"]').setInputFiles(validFile);
  await expect(page.getByRole("button", { name: "Analyze this document" })).toBeVisible();

  await page.route("**/api/analyze", (route) => route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ error: { code: "authentication" } }),
  }));
  await page.getByRole("button", { name: "Analyze this document" }).click();
  await expect(page.getByText("Live analysis could not authenticate. The comprehensive sample is still available.")).toBeVisible();

  await page.unroute("**/api/analyze");
  await page.route("**/api/analyze", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      carePlan: {
        ...comprehensiveCarePlan,
        documentMetadata: { ...comprehensiveCarePlan.documentMetadata, synthetic: false },
        analysisMetadata: {
          ...comprehensiveCarePlan.analysisMetadata,
          mode: "live_api",
          model: "mock-live",
          liveApiUsed: true,
        },
      },
    }),
  }));
  await page.getByRole("button", { name: "Analyze this document" }).click();
  await expect(page.getByRole("heading", { name: "Your next steps, organized from the discharge document" })).toBeVisible();
  await page.getByRole("button", { name: /View source.*p\. 2/, exact: true }).first().click();
  await expect(page.getByAltText("Uploaded discharge instruction image")).toBeVisible();
  await page.getByRole("button", { name: "Close source verification" }).click();
  await page.getByRole("button", { name: "Reset and clear", exact: true }).click();
  const revokedUrlCount = await page.evaluate(() => (window as unknown as { __clearcareRevokedUrls: string[] }).__clearcareRevokedUrls.length);
  expect(revokedUrlCount).toBeGreaterThanOrEqual(2);
});
