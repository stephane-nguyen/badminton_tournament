import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { setTournamentLink, Tournament } from "./Tournament";
import { researchDoubleMixteRankD, researchSimpleRankP } from "./common";

// Load environment variables
dotenv.config();

// Define the type for the mail options
type MailOptions = {
  from: string | undefined;
  to: string | string[] | undefined;
  subject: string;
  html: string;
};

// Define the callback type
type GetMailOptions = (htmlContent: string) => MailOptions;

export function getMailOptions(htmlContent: string) {
  return {
    from: process.env.EMAIL_USER, // Sender address
    to: process.env.EMAIL_RECIPIENT, // Recipient address
    subject: researchSimpleRankP, // Subject
    html: htmlContent, // HTML content
  };
}

export function getMailOptionsVersailles(htmlContent: string): MailOptions {
  return {
    from: process.env.EMAIL_USER, // Sender address
    to: process.env.EMAIL_RECIPIENT2,
    subject: researchDoubleMixteRankD,
    html: htmlContent,
  };
}
// Send the email with the tournament data
export async function sendEmail(mailOptions: MailOptions) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

// Generate the HTML table for the tournament data
export function generateHTMLTable(tournaments: Set<Tournament>): string {
  let htmlContent = `
      <html>
        <body>
          <h1>Badminton Tournaments</h1>
          <table border="1" cellpadding="5" cellspacing="0">
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Location</th>
              <th>Time Remaining</th>
              <th>Players Count</th>
            </tr>`;

  tournaments.forEach((tournament) => {
    const link = setTournamentLink(tournament.link);
    htmlContent += `
      <tr>
        <td><a href="${link}" target="_blank">${tournament.name}</a></td>
        <td>${tournament.date}</td>
        <td>${tournament.location}</td>
        <td>${tournament.timeRemaining}</td>
        <td>${tournament.playersCount}</td>
      </tr>`;
  });

  htmlContent += `
        </table>
      </body>
    </html>`;

  return htmlContent;
}
