import { test } from "@playwright/test";

import { stringifyData, Tournament } from "../helpers/Tournament";
import { getUniqueFilename, writeDataToFile } from "../helpers/file";
import { generateHTMLTable, sendEmail } from "../helpers/email";

test("test", async ({ page }) => {
  await page.goto("https://badnet.fr/");

  // City
  await page.getByPlaceholder("Rechercher une ville...").click();
  await page
    .getByPlaceholder("Rechercher une ville...")
    .fill("Neuilly-sur-Marne");
  await page.getByText("Neuilly-sur-Marne (93, Île-de-France)").click();
  // Km
  await page.locator("#rayon").click();
  await page.locator("#rayon").fill("50");
  // Senior
  await page.locator("div:nth-child(2) > label").first().click();
  // Simple
  await page.locator("div:nth-child(2) > .flex > div > label").first().click();
  // Classement P
  await page
    .locator("div:nth-child(3) > .flex > div:nth-child(4) > label")
    .click();
  // P12
  await page.locator("div:nth-child(6) > .flex > .div-p > label").click();
  // Ouvert aux inscriptions
  await page
    .locator("div:nth-child(2) > div:nth-child(2) > .flex > div > label")
    .first()
    .click();
  // Prochainement ouvert
  await page
    .locator(
      "div:nth-child(2) > div:nth-child(2) > .flex > div:nth-child(2) > label"
    )
    .click();
  // Place disponibles
  await page
    .locator(
      "div:nth-child(2) > div:nth-child(2) > .flex > div:nth-child(3) > label"
    )
    .click();

  // Wait for the search results to load (adjust the selector to your needs)
  await page.waitForSelector("#search_results .row", { state: "visible" }); // Wait for at least one tournament to appear
  // Wait for at least one `.cell` to appear within the rows
  await page.waitForSelector("#search_results .row .cell", {
    state: "visible",
  });
  await page.waitForTimeout(2000);

  // Scrape tournament data
  const tournaments = await page.evaluate(() => {
    // Results based on test automation
    const tournamentElements = document.querySelectorAll(
      "#search_results .row"
    );

    if (tournamentElements === null) {
      return [
        {
          name: "none",
          date: "none",
          location: "none",
          timeRemaining: "none",
          playersCount: "0",
        },
      ];
    }

    const data: Tournament[] = [];

    tournamentElements.forEach((element) => {
      const cells = element.querySelectorAll(".cell");
      const firstCell = cells[0];
      const secondCell = cells[1];

      const name =
        firstCell.querySelector(".name")?.textContent?.trim() || "N/A";

      // Skip internal tournaments
      let checkInternalTournament = name.toLowerCase();
      if (
        checkInternalTournament.includes("intra") ||
        checkInternalTournament.includes("interne")
      ) {
        return;
      }

      const date =
        firstCell.querySelector(".date")?.textContent?.trim() || "N/A";
      const location =
        firstCell.querySelector(".location")?.textContent?.trim() || "N/A";

      // Inscriptions
      // Handle all case of css class: .limit, .limit open, .limit alert...
      const timeRemainingElement = secondCell.querySelector('[class^="limit"]');

      let timeRemaining = "N/A";
      if (timeRemainingElement) {
        // Extract only text outside <span> elements
        timeRemaining =
          Array.from(timeRemainingElement.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim())
            .join(" ") || "N/A";
      }

      const playersCount =
        secondCell.querySelector(".count")?.textContent?.trim() || "N/A";
      if (playersCount !== "N/A") {
        // Regular expression to match "number/number" e.g "48/300"
        const match = playersCount.match(/^(\d+)\/(\d+)$/);
        if (match) {
          const leftNumber = parseInt(match[1], 10);
          const rightNumber = parseInt(match[2], 10);

          // Skip this iteration/tournament
          if (leftNumber >= rightNumber) {
            return;
          }
        }
      }

      data.push({ name, date, location, timeRemaining, playersCount });
    });
    return data;
  });

  // Define the base name and directory for the file
  const directory = "./";
  const baseName = "tournament_list";
  const extension = ".json";

  const uniqueFilename = await getUniqueFilename(
    baseName,
    extension,
    directory
  );

  // Needed to respect typing of writeFileSync
  const stringifiedTournaments = stringifyData(tournaments);
  writeDataToFile(uniqueFilename, stringifiedTournaments);

  const htmlContent = generateHTMLTable(tournaments);
  await sendEmail(htmlContent);
});
