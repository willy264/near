import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({ headless: true });
const checks: string[] = [];
try {
  for (const width of [360, 1280]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
      colorScheme: width===360?'light':'dark',
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(process.env.VIEWER_URL??"http://127.0.0.1:4173/", { waitUntil: "networkidle" });
    await page
      .locator("#source")
      .filter({ hasText: "Recorded" })
      .waitFor();
    if ((await page.locator("#graph .edges path").count()) === 0)
      throw Error("Trading graph is empty");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    if (overflow) throw Error(`Horizontal overflow at ${width}px`);
    await page.screenshot({
      path: `docs/evidence/viewer-${width}.png`,
      fullPage: true,
    });
    await page.locator("#stage").fill("2");
    await page.locator("#stage").dispatchEvent("input");
    if ((await page.locator("#graph .edges path").count()) !== 0)
      throw Error("Settled replay should have no edges");
    await page.locator('[data-scenario="supply-chain"]').click();
    if (
      !(await page.locator("#numbers").innerText()).includes("0% of accepted")
    )
      throw Error("Control ratio mismatch");
    await page.locator('[data-scenario="firms"]').click();
    if (!(await page.locator("#graph-title").innerText()).includes("Fictional"))
      throw Error("Firms not labeled fictional");
    // Deliberately unavailable network checks the clearly labeled fallback, not live evidence.
    await page.route("https://test.rpc.fastnear.com/**", (route) =>
      route.abort(),
    );
    await page.route("https://near-testnet.drpc.org/**", (route) =>
      route.abort(),
    );
    await page.locator("#live").click();
    await page
      .locator("#source")
      .filter({ hasText: "RPC unavailable" })
      .waitFor();
    await page.locator("#dry").click();
    await page
      .locator("#dry-result")
      .filter({ hasText: "Dry-run was not performed" })
      .waitFor();
    if (errors.length) throw Error(errors.join("\n"));
    checks.push(
      `${width}px: recorded graph, replay, controls, fictional label, no horizontal overflow, RPC fallback and unavailable dry-run passed; no page errors.`,
    );
    await page.close();
  }
  writeFileSync(
    "docs/evidence/browser.md",
    `# Browser checks\n\nCommand: pnpm exec tsx scripts/browser-check.ts\n\n${checks.join("\n\n")}\n\nScreenshots show recorded simulated data, with local/testnet mode labeled in the UI. The 360px check uses light mode; 1280px uses dark mode. Both respect reduced motion. RPC was intentionally blocked for fallback tests; these checks do not prove a live RPC response.\n`,
  );
  console.log(checks.join("\n"));
} finally {
  await browser.close();
}
