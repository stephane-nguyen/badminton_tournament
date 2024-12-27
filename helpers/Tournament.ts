export type Tournament = {
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
