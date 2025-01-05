export type Tournament = {
  link: string; // /tournoi/public/informations?eventid=26402
  name: string;
  date: string;
  location: string;
  timeRemaining: string;
  playersCount: string;
};

// Function to convert Tournament data to string
export function stringifyData(tournaments: Tournament[]): string {
  return JSON.stringify(tournaments, null, 2); // Pretty-print the JSON data
}
export const baseURL = "https://badnet.fr";
// export const dashboardURL = baseURL + "/tableau-de-bord";
// export const rankedSearchURL = baseURL + "/recherche-competitions";
// export const validationCodeURL = baseURL + "/validation-code";

export function setTournamentLink(link: string) {
  return baseURL + link;
}
