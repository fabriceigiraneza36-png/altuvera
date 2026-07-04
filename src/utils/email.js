// utils/email.js (add these functions)

const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send notification to admin when new contact message received
 */
exports.sendContactNotification = async (message) => {
  const transporter = createTransporter();

  const priorityBadge = {
    urgent: '🔴 URGENT',
    high: '🟠 HIGH PRIORITY',
    normal: '🟢 Normal',
    low: '⚪ Low',
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Message</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #064e3b, #047857); padding: 32px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                    📬 New Contact Message
                  </h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
                    ${priorityBadge[message.priority] || priorityBadge.normal}
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 32px;">
                  <!-- Sender Info -->
                  <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 12px; color: #064e3b; font-size: 16px;">Sender Information</h3>
                    <p style="margin: 0 0 8px; color: #374151; font-size: 14px;">
                      <strong>Name:</strong> ${message.full_name}
                    </p>
                    <p style="margin: 0 0 8px; color: #374151; font-size: 14px;">
                      <strong>Email:</strong> <a href="mailto:${message.email}" style="color: #047857;">${message.email}</a>
                    </p>
                    ${message.phone ? `
                    <p style="margin: 0; color: #374151; font-size: 14px;">
                      <strong>Phone:</strong> <a href="tel:${message.phone}" style="color: #047857;">${message.phone}</a>
                    </p>
                    ` : ''}
                  </div>
                  
                  <!-- Trip Details (if provided) -->
                  ${message.trip_type || message.travel_date || message.number_of_travelers ? `
                  <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 12px; color: #92400e; font-size: 16px;">🌍 Trip Details</h3>
                    ${message.trip_type ? `<p style="margin: 0 0 8px; color: #374151; font-size: 14px;"><strong>Trip Type:</strong> ${message.trip_type}</p>` : ''}
                    ${message.travel_date ? `<p style="margin: 0 0 8px; color: #374151; font-size: 14px;"><strong>Travel Date:</strong> ${new Date(message.travel_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
                    ${message.number_of_travelers ? `<p style="margin: 0; color: #374151; font-size: 14px;"><strong>Travelers:</strong> ${message.number_of_travelers}</p>` : ''}
                  </div>
                  ` : ''}
                  
                  <!-- Subject -->
                  ${message.subject ? `
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
                  <p style="margin: 0 0 20px; color: #111827; font-size: 16px; font-weight: 600;">${message.subject}</p>
                  ` : ''}
                  
                  <!-- Message -->
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                  <div style="background-color: #f9fafb; border-left: 4px solid #047857; padding: 16px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message.message}</p>
                  </div>
                  
                  <!-- Action Button -->
                  <div style="text-align: center; margin-top: 32px;">
                    <a href="${process.env.FRONTEND_URL}/admin/messages/${message.id}" 
                       style="display: inline-block; background: linear-gradient(135deg, #064e3b, #047857); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      View in Dashboard →
                    </a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    Received at ${new Date(message.created_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">
                    Message ID: #${message.id} • Source: ${message.source || 'website'}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Altuvera Safaris" <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `${message.priority === 'urgent' ? '🔴 URGENT: ' : ''}New Contact: ${message.subject || message.full_name}`,
    html: htmlContent,
    replyTo: message.email,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send reply to contact message
 */
exports.sendContactReply = async ({ to, toName, subject, body, originalMessage, fromName, fromEmail }) => {
  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #064e3b, #047857); padding: 32px; text-align: center;">
                  <img src="${process.env.FRONTEND_URL}/logo-white.png" alt="Altuvera Safaris" style="height: 40px; margin-bottom: 16px;" onerror="this.style.display='none'">
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">
                    Altuvera Safaris
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 32px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                    Dear ${toName},
                  </p>
                  
                  <div style="color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
${body}
                  </div>
                  
                  <!-- Original Message Reference -->
                  ${originalMessage ? `
                  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Original Message</p>
                    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 3px solid #d1d5db;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${originalMessage.substring(0, 500)}${originalMessage.length > 500 ? '...' : ''}</p>
                    </div>
                  </div>
                  ` : ''}
                  
                  <!-- Signature -->
                  <div style="margin-top: 32px;">
                    <p style="margin: 0; color: #374151; font-size: 15px;">
                      Warm regards,<br>
                      <strong>${fromName}</strong><br>
                      <span style="color: #047857;">Altuvera Safaris Team</span>
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding: 0 32px 32px;">
                  <div style="background: linear-gradient(135deg, #f0fdf4, #d1fae5); border-radius: 12px; padding: 24px; text-align: center;">
                    <p style="margin: 0 0 16px; color: #064e3b; font-size: 15px; font-weight: 600;">
                      Ready to start planning your adventure?
                    </p>
                    <a href="${process.env.FRONTEND_URL}/contact" 
                       style="display: inline-block; background: linear-gradient(135deg, #064e3b, #047857); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      Contact Us
                    </a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #064e3b; padding: 24px; text-align: center;">
                  <p style="margin: 0 0 12px; color: rgba(255,255,255,0.9); font-size: 13px;">
                    Follow us on social media
                  </p>
                  <div style="margin-bottom: 16px;">
                    <a href="#" style="display: inline-block; margin: 0 6px; color: #ffffff; text-decoration: none;">Facebook</a>
                    <a href="#" style="display: inline-block; margin: 0 6px; color: #ffffff; text-decoration: none;">Instagram</a>
                    <a href="#" style="display: inline-block; margin: 0 6px; color: #ffffff; text-decoration: none;">Twitter</a>
                  </div>
                  <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 11px;">
                    © ${new Date().getFullYear()} Altuvera Safaris. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${fromName} - Altuvera Safaris" <${process.env.EMAIL_FROM}>`,
    to: to,
    subject: subject,
    html: htmlContent,
    replyTo: fromEmail || process.env.EMAIL_FROM,
  };

  return transporter.sendMail(mailOptions);
};