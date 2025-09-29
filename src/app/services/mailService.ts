import nodemailer from 'nodemailer'

export interface MailOptions {
  to: string
  subject: string
  html: string
}

export const getTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function sendMail({ to, subject, html }: MailOptions) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com'
  const transporter = getTransporter()
  const info = await transporter.sendMail({ from, to, subject, html })
  return info
}
