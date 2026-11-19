const { After, Before, Status, setDefaultTimeout } = require("@cucumber/cucumber");
const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("node:fs");
const path = require("node:path");

setDefaultTimeout(30 * 1000);

Before(async function () {
  const options = new chrome.Options();
  options.addArguments("--start-maximized");
  options.setLoggingPrefs({ browser: "ALL" });

  if (process.env.HEADLESS === "true") {
    options.addArguments("--headless=new");
    options.addArguments("--window-size=1366,768");
  }

  this.driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
});

After(async function (scenario) {
  if (!this.driver) {
    return;
  }

  try {
    if (scenario.result?.status === Status.FAILED) {
      const reportDirectory = path.join("reports", "failures");
      fs.mkdirSync(reportDirectory, { recursive: true });

      const scenarioName = scenario.pickle?.name || "unknown-scenario";
      const fileName = scenarioName
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();

      try {
        await this.driver.executeScript(() => {
          document.querySelectorAll('input[type="password"]').forEach((input) => {
            input.value = "";
          });
        });
        const screenshot = Buffer.from(await this.driver.takeScreenshot(), "base64");
        fs.writeFileSync(path.join(reportDirectory, `${fileName}.png`), screenshot);
        await this.attach(screenshot, "image/png");
      } catch (error) {
        console.error(`Falha ao capturar screenshot do cenário "${scenarioName}":`, error);
      }

      try {
        const browserLogs = await this.driver.manage().logs().get("browser");
        const logContent = browserLogs
          .map(({ level, message, timestamp }) => JSON.stringify({ level, message, timestamp }))
          .join("\n");
        fs.writeFileSync(path.join(reportDirectory, `${fileName}-browser.log`), logContent);
      } catch (error) {
        console.error(`Falha ao coletar logs do navegador para "${scenarioName}":`, error);
      }
    }
  } finally {
    await this.driver.quit();
  }
});
