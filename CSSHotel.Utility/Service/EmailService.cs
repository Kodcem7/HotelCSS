using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Security;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Utility.Service
{
    public class EmailService : IEmailService
    {
        private readonly EmailConfiguration _emailConfig;

        public EmailService(IConfiguration configuration)
        {
            // This reads the "EmailConfiguration" section from appsettings.json
            _emailConfig = configuration.GetSection("EmailConfiguration").Get<EmailConfiguration>();
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress("HotelCSS Admin", _emailConfig.From));
            emailMessage.To.Add(new MailboxAddress("", toEmail));
            emailMessage.Subject = subject;

            // We use HTML so you can make the email look nice later
            emailMessage.Body = new TextPart("html") { Text = message };

            using (var client = new SmtpClient())
            {
                // Connect to Gmail
                // If 465 doesn't work, try 587 with false
                await client.ConnectAsync(_emailConfig.SmtpServer, _emailConfig.Port, true);

                // Login
                await client.AuthenticateAsync(_emailConfig.Username, _emailConfig.Password);

                // Send
                await client.SendAsync(emailMessage);

                // Disconnect
                await client.DisconnectAsync(true);
            }
        }
    }
}
