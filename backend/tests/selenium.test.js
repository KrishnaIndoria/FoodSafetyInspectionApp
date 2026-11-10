
const { Builder, By, until, Select } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

async function runBrowserTest() {
    const options = new chrome.Options();

    // Open a visible Chrome browser
    const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

    try {
        const frontendPath = path.resolve(
            __dirname,
            "../../frontend/index.html"
        );

        await driver.get(pathToFileURL(frontendPath).href);

        // Enter inspection details
        const restaurant = "Selenium Test " + Date.now();

        await driver.findElement(By.id("restaurant"))
            .sendKeys(restaurant);

        await driver.findElement(By.id("inspector"))
            .sendKeys("Automated Test Inspector");

        await driver.findElement(By.id("date"))
            .sendKeys("2026-11-10");

        await driver.findElement(By.id("observations"))
            .sendKeys("Automated kitchen cleanliness check");

        const statusDropdown = new Select(
            await driver.findElement(By.id("status"))
        );

        await statusDropdown.selectByVisibleText("Pass");

        // Submit the inspection
        await driver.findElement(
            By.css("#inspectionForm button[type='submit']")
        ).click();

        // Wait for successful save message
        const message = await driver.findElement(By.id("message"));

        await driver.wait(
            until.elementTextContains(
                message,
                "Inspection saved successfully"
            ),
            5000
        );

        const auditList = await driver.findElement(By.id("auditList"));
        const displayedRecords = await auditList.getText();

        assert.ok(displayedRecords.includes(restaurant));

        console.log("PASS: Chrome opened the inspection application");
        console.log("PASS: Selenium filled and submitted the form");
        console.log("PASS: Inspection was saved successfully");

        // Save browser screenshot
        const screenshotPath = path.resolve(
            __dirname,
            "../../Screenshots/10_Selenium_Browser_Test.png"
        );

        fs.mkdirSync(path.dirname(screenshotPath), {
            recursive: true
        });

        const screenshot = await driver.takeScreenshot();

        fs.writeFileSync(
            screenshotPath,
            Buffer.from(screenshot, "base64")
        );

        console.log("Screenshot saved:", screenshotPath);

    } finally {
        await driver.quit();
    }
}

runBrowserTest().catch(error => {
    console.error("Selenium test failed:", error);
    process.exitCode = 1;
});
