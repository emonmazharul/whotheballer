import { Resend } from "resend";
import { resetPasswordHTMLTemplate } from "./resetPasswordTemplate.js";

export async function sendResetPasswordEmail(
  fullName: string,
  resetLink: string,
  userEmail:string,
) {
  const resend = new Resend(process.env.EMAIL_KEY);
  const subject = `Password reset request for whotheballer`;
  const html = resetPasswordHTMLTemplate(fullName, resetLink);
  const { data, error } = await resend.emails.send({
    from: process.env.ADMIN_SENDER_EMAIL!,
    to: userEmail,
    subject: subject,
    html,
  });

  if (error) {
    return { error: "can't send email" };
  }

  return { id: data.id };
}
