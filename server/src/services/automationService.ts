import { chromium, Browser, Page } from "playwright";

export class AutomationService {
  private browser: Browser | null = null;

  // Initialize Playwright Headless Browser
  public async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
      });
    }
  }

  // Extract page title or log context from a URL if needed
  public async extractContextFromUrl(url: string): Promise<string> {
    try {
      await this.initBrowser();
      if (!this.browser) throw new Error("Browser initialization failed");

      const page: Page = await this.browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

      const pageTitle = await page.title();
      const bodyText = await page.locator("body").innerText();

      await page.close();

      // Return concise context chunk
      return `URL Title: ${pageTitle}\nPage Snippet: ${bodyText.slice(0, 500)}`;
    } catch (error) {
      console.error("Playwright automation error:", error);
      return "Automation log extraction failed.";
    }
  }

  // Close browser when server shuts down
  public async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const automationService = new AutomationService();