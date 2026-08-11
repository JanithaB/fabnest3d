/**
 * Email service via Gmail SMTP (Nodemailer + App Password)
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export interface PIEmailData {
  to: string
  customerName: string
  quoteRequestId: string
  fileName: string
  material: string
  quality: string
  price: number
  adminNotes?: string
  adminName?: string
}

export interface OrderStatusEmailData {
  to: string
  customerName: string
  orderId: string
  previousStatus: string
  newStatus: string
  trackingNumber?: string | null
  estimatedDelivery?: Date | string | null
}

export interface QuoteStatusEmailData {
  to: string
  customerName: string
  quoteRequestId: string
  fileName: string
  status: 'quoted' | 'rejected'
  price?: number | null
  adminNotes?: string | null
}

function getEmailConfig() {
  const user =
    process.env.GMAIL_USER?.trim() ||
    process.env.ADMIN_EMAIL?.trim()
  const pass = (
    process.env.GMAIL_APP_PASSWORD ||
    process.env.APP_PASSCODE ||
    ''
  ).replace(/\s+/g, '')
  const from =
    process.env.EMAIL_FROM?.trim() ||
    (user ? `Fabnest3D <${user}>` : undefined)

  return { user, pass: pass || undefined, from }
}

function createTransporter(): Transporter | null {
  const { user, pass } = getEmailConfig()
  if (!user || !pass) {
    console.warn(
      'Email not configured: set GMAIL_USER and GMAIL_APP_PASSWORD in .env'
    )
    return null
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  })
}

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { from } = getEmailConfig()
    const transporter = createTransporter()

    if (!transporter || !from) {
      return {
        success: false,
        error: 'Email credentials not configured (GMAIL_USER / GMAIL_APP_PASSWORD)',
      }
    }

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    return { success: true }
  } catch (error: any) {
    console.error('Email sending error:', error)
    const message = error.message || 'Failed to send email'
    // Make Gmail auth failures obvious in logs
    if (error.code === 'EAUTH' || String(message).includes('Invalid login')) {
      console.error(
        'Gmail rejected login. Generate a new App Password at https://myaccount.google.com/apppasswords and set GMAIL_USER + GMAIL_APP_PASSWORD in .env, then restart the server.'
      )
    }
    return { success: false, error: message }
  }
}

function formatStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function emailShell(title: string, bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0f766e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .price { font-size: 24px; font-weight: bold; color: #0f766e; }
        .status { font-size: 20px; font-weight: bold; color: #0f766e; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
          <p>FABNEST 3D Printing Service</p>
        </div>
        <div class="content">
          ${bodyHtml}
        </div>
        <div class="footer">
          <p>This is an automated message from FABNEST 3D.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Send Proforma Invoice (PI) email to customer
 */
export async function sendPIEmail(
  data: PIEmailData
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: data.to,
    subject: `Proforma Invoice - ${data.fileName}`,
    html: generatePIEmailHTML(data),
  })
}

/**
 * Notify customer when their order status changes
 */
export async function sendOrderStatusEmail(
  data: OrderStatusEmailData
): Promise<{ success: boolean; error?: string }> {
  const shortId = data.orderId.slice(0, 8)
  const statusLabel = formatStatusLabel(data.newStatus)

  const trackingHtml = data.trackingNumber
    ? `<p><strong>Tracking:</strong> ${data.trackingNumber}</p>`
    : ''
  const etaHtml = data.estimatedDelivery
    ? `<p><strong>Estimated delivery:</strong> ${new Date(data.estimatedDelivery).toLocaleDateString()}</p>`
    : ''

  const html = emailShell(
    'Order Update',
    `
      <p>Dear ${data.customerName},</p>
      <p>Your order <strong>#${shortId}</strong> status has been updated.</p>
      <div class="details">
        <p><strong>Previous status:</strong> ${formatStatusLabel(data.previousStatus)}</p>
        <p class="status">New status: ${statusLabel}</p>
        ${trackingHtml}
        ${etaHtml}
      </div>
      <p>You can view your order details in your account dashboard.</p>
      <p>Best regards,<br>FABNEST 3D Team</p>
    `
  )

  return sendEmail({
    to: data.to,
    subject: `Order #${shortId} is now ${statusLabel}`,
    html,
  })
}

/**
 * Notify customer when a quote is quoted (without PI) or rejected
 */
export async function sendQuoteStatusEmail(
  data: QuoteStatusEmailData
): Promise<{ success: boolean; error?: string }> {
  const shortId = data.quoteRequestId.slice(0, 8)
  const isRejected = data.status === 'rejected'

  const priceHtml =
    data.price != null
      ? `<p class="price">LKR ${Number(data.price).toFixed(2)}</p>`
      : ''
  const notesHtml = data.adminNotes
    ? `<p><strong>Notes:</strong> ${data.adminNotes}</p>`
    : ''

  const body = isRejected
    ? `
      <p>Dear ${data.customerName},</p>
      <p>Unfortunately, your quote request <strong>#${shortId}</strong> for <strong>${data.fileName}</strong> has been rejected.</p>
      <div class="details">
        ${notesHtml || '<p>Please contact us if you have questions or would like to submit a revised request.</p>'}
      </div>
      <p>Best regards,<br>FABNEST 3D Team</p>
    `
    : `
      <p>Dear ${data.customerName},</p>
      <p>Your quote request <strong>#${shortId}</strong> for <strong>${data.fileName}</strong> has been updated.</p>
      <div class="details">
        <h3>Quote Details</h3>
        <p><strong>File:</strong> ${data.fileName}</p>
        ${priceHtml}
        ${notesHtml}
      </div>
      <p>Please visit your account dashboard to review and accept this quote.</p>
      <p>Best regards,<br>FABNEST 3D Team</p>
    `

  return sendEmail({
    to: data.to,
    subject: isRejected
      ? `Quote request #${shortId} was rejected`
      : `Quote ready for #${shortId} - ${data.fileName}`,
    html: emailShell(isRejected ? 'Quote Rejected' : 'Quote Update', body),
  })
}

function generatePIEmailHTML(data: PIEmailData): string {
  return emailShell(
    'Proforma Invoice',
    `
      <p>Dear ${data.customerName},</p>
      <p>Thank you for your quote request. Please find below the Proforma Invoice for your 3D printing order.</p>
      
      <div class="details">
        <h3>Order Details</h3>
        <p><strong>File:</strong> ${data.fileName}</p>
        <p><strong>Material:</strong> ${data.material}</p>
        <p><strong>Quality:</strong> ${data.quality}</p>
        ${data.adminNotes ? `<p><strong>Notes:</strong> ${data.adminNotes}</p>` : ''}
      </div>
      
      <div class="details">
        <h3>Pricing</h3>
        <p class="price">LKR ${data.price.toFixed(2)}</p>
      </div>
      
      <p>If you accept this quote, please visit your account dashboard to proceed with your order.</p>
      
      <p>Best regards,<br>${data.adminName || 'FABNEST 3D Team'}<br>FABNEST 3D Printing Service</p>
    `
  )
}
