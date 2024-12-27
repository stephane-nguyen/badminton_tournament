import fs from "fs";
import path from "path";

export async function getUniqueFilename(
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

export function writeDataToFile(filename, string) {
  // Write the data to the file
  fs.writeFileSync(filename, string);
}
