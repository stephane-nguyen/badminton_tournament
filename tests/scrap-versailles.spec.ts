import { test } from "@playwright/test";

import {
  baseURL,
  deduplicateTournaments,
  Tournament,
} from "../helpers/Tournament";
import {
  generateHTMLTable,
  getMailOptionsVersailles,
  sendEmail,
} from "../helpers/email";

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

test("Badminton Versailles 30km Double Mixte", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto(baseURL);
  await page.getByPlaceholder("Rechercher une ville...").fill("Versailles");
  const firstCityFromSearch = page
    .locator(".tt-dataset.tt-dataset-citydataset > div")
    .nth(0);
  await firstCityFromSearch.waitFor({ state: "visible" });
  await page.waitForTimeout(3000);
  await firstCityFromSearch.click();
  // Km
  await page.locator("#rayon").click();
  await page.locator("#rayon").fill("30");
  // Senior
  await page.locator("div:nth-child(2) > label").first().click();
  // Double
  await page
    .locator("div:nth-child(2) > .flex > div:nth-child(2) > label")
    .first();
  // Mixte
  await page
    .locator("div:nth-child(2) > .flex > div:nth-child(3) > label")
    .first();
  // Classement D
  await page
    .locator("div:nth-child(3) > .flex > div:nth-child(3) > label")
    .click();
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
  await page.waitForSelector("#search_results .row", { timeout: 10000 });
  // Wait for at least one `.cell` to appear within the rows
  await page.waitForSelector("#search_results .row .cell", {
    state: "visible",
  });

  await page.waitForTimeout(2000);

  let tournaments = new Set<Tournament>();
  const maxPageNumber = 4; // We assume there is no more than 40 tournaments who would be available.

  for (let pageNumber = 1; pageNumber <= maxPageNumber; pageNumber++) {
    const current = await page
      .locator("#search_results")
      .getByText(`${pageNumber}`, { exact: true });
    await page.waitForTimeout(3000);

    if (!(await current.isVisible())) break;
    if (pageNumber > 1) {
      await current.click(); // Click the page number if not the first page
      await page.waitForTimeout(4000);
    }

    const newTournaments = await page.evaluate(() => {
      const data: Tournament[] = [];
      const tournamentElements = document.querySelectorAll(
        "#search_results .row"
      );
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
        const timeRemainingElement =
          secondCell.querySelector('[class^="limit"]');

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
            const playerRegistered = parseInt(match[1], 10);
            const maxNumberOfPlayers = parseInt(match[2], 10);
            if (playerRegistered >= maxNumberOfPlayers) {
              return;
            }
          }
        }

        const link = element.getAttribute("href")!;

        data.push({
          link,
          name,
          date,
          location,
          timeRemaining,
          playersCount,
        });
      });
      return data;
    });
    newTournaments.forEach((tournament) => tournaments.add(tournament));
  }
  tournaments = deduplicateTournaments(tournaments);

  const htmlContent = generateHTMLTable(tournaments);
  await sendEmail(getMailOptionsVersailles(htmlContent));
});
