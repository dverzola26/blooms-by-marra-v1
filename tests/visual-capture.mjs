import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
for (const [label, width, height] of [
  ["desktop", 1440, 1000],
  ["reference-desktop", 908, 900],
  ["mobile", 375, 812],
  ["tablet", 768, 1024],
]) {
  await page.setViewportSize({ width, height });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.locator(".reference-values").waitFor();
  await page.locator("img").evaluateAll((imgs) =>
    Promise.all(
      imgs.map((img) => {
        img.loading = "eager";
        return img.decode().catch(() => {});
      }),
    ),
  );
  await page.screenshot({
    path: `artifacts/home-${label}.png`,
    fullPage: true,
  });
  console.log(
    label,
    await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      height: document.body.scrollHeight,
      hero: document.querySelector(".reference-hero").getBoundingClientRect()
        .height,
      errors: [...document.images].filter(
        (i) => !i.complete || i.naturalWidth === 0,
      ).length,
      overflow: [...document.querySelectorAll("body *")]
        .filter(
          (e) =>
            e.getBoundingClientRect().right > innerWidth + 1 &&
            !e.closest(".reference-occasions") &&
            !e.closest(".hero-art"),
        )
        .slice(0, 8)
        .map((e) => e.className),
    })),
  );
}
await browser.close();
