import { schedule } from 'node-cron';
import { SMTPClient } from 'emailjs';
import { randomBytes, createHash } from 'crypto';

// Generate a unique campaign ID
function generateCampaignId() {
  const uniqueString = `${Date.now()}_${randomBytes(16).toString('hex')}`;
  const campaignId = createHash('sha256').update(uniqueString).digest('hex');
  return campaignId;
}

// Example usage of generateCampaignId
const campaignId = generateCampaignId();
console.log(campaignId);

const sendMail = async (subject, toEmail, otpText, email, appPassword, dateInfo, id) => {
  const client = new SMTPClient({
    user: email,
    password: appPassword,
    host: 'smtp.gmail.com',
    ssl: true,
  });

  const Server1 = process.env.NEXT_PUBLIC_URL;
  const htmlBody = '<p>' + otpText + '</p>' + '<img src = "' + Server1 + '/api/track/?Id=' + id + '" >';
  console.log(htmlBody);

  const { day, month, date, hours, minutes, seconds } = dateInfo;
  console.log(day, month, date, hours, minutes, seconds);

  // Define a cron expression based on the date and time information
  const cronExpression = `${seconds} ${minutes} ${hours} ${date} ${month} ${day}`;

  // Schedule the email to be sent at the specified time
  schedule(cronExpression, async function () {
    console.log('---------------------');
    console.log('Running Cron Process');

    var message = {
      text: otpText,
      from: email,
      to: toEmail,
      subject: subject,
      attachment: [
        { data: htmlBody, alternative: true },
      ],
    };

    try {
      // Delivering mail with send method
      const response = await client.sendAsync(message);
      console.log('Email sent: ', response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });
};

export default sendMail;
