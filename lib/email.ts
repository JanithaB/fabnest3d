/**
 * Email service utility
 * TODO: Integrate with email service (SendGrid, Resend, Nodemailer, etc.)
 */

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

/**
 * Send Proforma Invoice (PI) email to customer
 * 
 * @param data - Email data including customer info and quote details
 * @returns Promise<boolean> - true if sent successfully
 */
export async function sendPIEmail(data: PIEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement actual email sending
    // Example with Nodemailer, SendGrid, Resend, etc.
    
    // For now, just log the email that would be sent
    console.log('📧 PI Email would be sent:')
    console.log(`   To: ${data.to}`)
    console.log(`   Customer: ${data.customerName}`)
    console.log(`   File: ${data.fileName}`)
    console.log(`   Material: ${data.material}`)
    console.log(`   Quality: ${data.quality}`)
    console.log(`   Price: LKR ${data.price.toFixed(2)}`)
    console.log(`   Notes: ${data.adminNotes || 'None'}`)
    console.log(`   Admin: ${data.adminName || 'N/A'}`)
    
    // Example implementation with Nodemailer:
    /*
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      // Configure your email service
    })
    
    await transporter.sendMail({
      from: 'noreply@fabnest3d.com',
      to: data.to,
      subject: `Proforma Invoice - ${data.fileName}`,
      html: generatePIEmailHTML(data)
    })
    */
    
    // For production, integrate with:
    // - SendGrid: https://sendgrid.com
    // - Resend: https://resend.com
    // - AWS SES: https://aws.amazon.com/ses
    // - Nodemailer: https://nodemailer.com
    
    return { success: true }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate HTML email template for Proforma Invoice
 */
function generatePIEmailHTML(data: PIEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .price { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Proforma Invoice</h1>
          <p>FABNEST 3D Printing Service</p>
        </div>
        <div class="content">
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
          
          <p>If you accept this quote, please reply to this email or visit your account dashboard to proceed with your order.</p>
          
          <p>Best regards,<br>${data.adminName || 'FABNEST 3D Team'}<br>FABNEST 3D Printing Service</p>
        </div>
        <div class="footer">
          <p>This is a Proforma Invoice and does not constitute a final invoice.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

