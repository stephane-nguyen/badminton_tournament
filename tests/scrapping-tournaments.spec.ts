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

  // Scrape tournament data
  const tournaments = await page.evaluate(() => {
    // Results based on test automation
    const searchResults = document.getElementById("search_results");
    if (searchResults === null) {
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

    const tournamentElements = searchResults.querySelectorAll(".row");
    const data: Tournament[] = [];

    tournamentElements.forEach((element, index) => {
      const number = index + 1;
      const name =
        element.querySelector(".name")?.textContent?.trim() || "Unknown";
      const date =
        element.querySelector(".date")?.textContent?.trim() || "Unknown";
      const location =
        element.querySelector(".location")?.textContent?.trim() || "Unknown";
      const timeRemaining =
        element.querySelector(".limit alert")?.textContent?.trim() || "Unknown";

      const playersCount =
        element.querySelector(".count")?.textContent?.trim() || "Unknown";

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
