import { test } from "@playwright/test";

import fs from "fs";
import path from "path";

async function getUniqueFilename(
  baseName: string,
  extension: string,
  directory: string
): Promise<string> {
  let counter = 0;
  let fileName = `${baseName}${extension}`;

  // Check if the file exists and increment the counter
  while (fs.existsSync(path.join(directory, fileName))) {
    counter++;
    fileName = `${baseName}${counter}${extension}`;
  }
  return path.join(directory, fileName);
}

type Tournament = {
  number: number;
  name: string;
  date: string;
  location: string;
  timeRemaining: string;
  playersCount: string;
};

// Function to convert Tournament data to string
function stringifyData(tournaments: Tournament[]): string {
  return JSON.stringify(tournaments, null, 2); // Pretty-print the JSON data
}

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

  await page
    .locator("div:nth-child(3) > .flex > div:nth-child(4) > label")
    .click();
  await page.locator("div:nth-child(6) > .flex > .div-p > label").click();
  // Senior
  await page.locator("div:nth-child(2) > label").first().click();
  await page.locator("div:nth-child(2) > .flex > div > label").first().click();
  await page
    .locator("div:nth-child(2) > div:nth-child(2) > .flex > div > label")
    .first()
    .click();
  await page
    .locator(
      "div:nth-child(2) > div:nth-child(2) > .flex > div:nth-child(2) > label"
    )
    .click();
  await page
    .locator(
      "div:nth-child(2) > div:nth-child(2) > .flex > div:nth-child(3) > label"
    )
    .click();

  // Wait for the search results to load (adjust the selector to your needs)
  await page.waitForSelector("#search_results .row"); // Wait for at least one tournament to appear

  // Scrape tournament data
  const tournaments = await page.evaluate(() => {
    // Results based on test automation
    const tournamentElements = document.querySelectorAll(
      "#search_results .row"
    );

    if (tournamentElements === null) {
      return [
        {
          number: 1,
          name: "none",
          date: "none",
          location: "none",
          timeRemaining: "none",
          playersCount: "0",
        },
      ];
    }

    const data: Tournament[] = [];

    tournamentElements.forEach((element, index) => {
      const cells = element.querySelectorAll(".cell");
      const firstCell = cells[0];
      const secondCell = cells[1];

      const number = index + 1;
      const name =
        firstCell.querySelector(".name")?.textContent?.trim() || "Unknown";
      const date =
        firstCell.querySelector(".date")?.textContent?.trim() || "Unknown";
      const location =
        firstCell.querySelector(".location")?.textContent?.trim() || "Unknown";

      const timeRemaining = getTimeRemaining(secondCell);
      const playersCount =
        secondCell.querySelector(".count")?.textContent?.trim() || "Unknown";

      data.push({ number, name, date, location, timeRemaining, playersCount });
    });
    return data;
  });

  // Define the base name and directory for the file
  const directory = "./";
  const baseName = "tournament_list";
  const extension = ".txt";

  const uniqueFilename = await getUniqueFilename(
    baseName,
    extension,
    directory
  );

  // Needed to respect typing of writeFileSync
  const stringifiedTournaments = stringifyData(tournaments);

  // Write the data to the file
  fs.writeFileSync(uniqueFilename, stringifiedTournaments);
});

function getTimeRemaining(secondCell) {
  // Remove span elements by querying the `.limit.alert` and filtering out spans
  const timeRemainingElement = secondCell.querySelector(".limit.alert");
  const timeRemaining = timeRemainingElement
    ? timeRemainingElement.textContent
        ?.replace(/<span[^>]*>.*?<\/span>/g, "")
        .trim() || "Unknown"
    : "Unknown";
  return timeRemaining;
}
