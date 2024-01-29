import sendMail from "@/service/mailService";
import { connectMongoDB } from '@/lib/mongodb';
import EmailTracking from "@/models/EmailTracking";

const handler = async (req, res) => {
  try {
    const { method } = req;
    switch (method) {
      case "POST": {
        const { subject, body, email, appPassword, additionalAccounts, data, dateInfo, id, mail } = req.body;
        const dateTimeObject = new Date();
        console.log(`Time: ${dateTimeObject.toTimeString()}`);
        console.log("checking = ",email, appPassword, additionalAccounts, data, subject, body, dateInfo, id, mail);

        const companyRegex = /\{company\}/g;
        const otherRegex = /\{other\}/g;
        const nameRegex = /\{name\}/g;
        const emailRegex = /\{email\}/g;

        await connectMongoDB();

        // A function to send emails and update tracking
        const processEmailSending = async (accountEmail, accountPassword, item) => {
          const { name, email: em, company, other } = item;
          const sub = subject.replace(nameRegex, name).replace(companyRegex, company).replace(otherRegex, other);
          const bodies = body.replace(nameRegex, name).replace(companyRegex, company).replace(otherRegex, other).replace(emailRegex, em);

          const existingRecord = await EmailTracking.findOne({ campid: id });
          if (existingRecord) {
            existingRecord.sent += 1;
            await existingRecord.save();
          } else {
            await EmailTracking.create({ user: mail, campid: id, sent: 1 });
          }

          return sendMail(sub, em, bodies, accountEmail, accountPassword, dateInfo, id);
        };

        // Send emails using the primary account
        for (const item of data) {
          try {
            await processEmailSending(email, appPassword, item);
          } catch (error) {
            console.error("Error sending email with primary account:", error);
          }
        }

        // Send emails using additional accounts
        if (additionalAccounts && additionalAccounts.length) {
          for (const additionalAccount of additionalAccounts) {
            for (const item of data) {
              try {
                console.log("additional Account running")
                await processEmailSending(additionalAccount.email, additionalAccount.appPassword, item);
                console.log("additional account password", additionalAccount.appPassword)
              } catch (error) {
                console.error(`Error sending email with additional account (${additionalAccount.email}):`, error);
              }
            }
          }
        }

        res.status(200).send("Success");
        break;
      }
      default:
        res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (err) {
    res.status(400).json({ error_code: "api_one", message: err.message });
  }
};

export default handler;












// import { sendMail } from "service/mailService";
// import { connectMongoDB } from 'lib/mongodb';
// import EmailTracking from "models/EmailTracking";

// const handler = async (req, res) => {
//   try {
//     const { method } = req;
//     switch (method) {
//       case "POST": {
//         const { subject, body, email, appPassword, data, dateInfo, id, mail } = req.body;
//         console.log(email);
//         console.log(appPassword);
//         console.log(data);
//         console.log(subject);
//         console.log(body);
//         console.log(dateInfo);
//         console.log(id);
//         console.log(mail)

//         const companyRegex = /\{company\}/g;
//         const otherRegex = /\{other\}/g;
//         const nameRegex = /\{name\}/g;
//         const emailRegex = /\{email\}/g;

//         await connectMongoDB();

//         for (const item of data) {
//           const { name, email: em, company, other } = item;
//           const sub = subject;

//           let bodies = body.replace(nameRegex, name);
//           bodies = bodies.replace(companyRegex, company);
//           bodies = bodies.replace(otherRegex, other);
//           bodies = bodies.replace(emailRegex, em);
//           const existingRecord = await EmailTracking.findOne({ campid: id });

//           if (existingRecord) {
//             // If the email exists, increment the 'sent' count
//             existingRecord.sent += 1;
//             await existingRecord.save(); // Save the updated record
//           } else {
//             await EmailTracking.create({user:mail, campid: id, sent: 1 });
//           }

//           try {
//                await sendMail(sub, em, bodies, email, appPassword, dateInfo,  id);
           

//           } catch (error) {
//             // Handle the error here or return it in the response
//             console.error("Error sending email:", error);
//             return res.status(400).json({
//               error_code: "api_four",
//               message: error.message,
//             });
//           }
//         }

//         res.status(200).send("Success");
//         break;
//       }
//       default:
//         res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
//         res.status(405).end(`Method ${method} Not Allowed`);
//         break;
//     }
//   } catch (err) {
//     res.status(400).json({
//       error_code: "api_one",
//       message: err.message,
//     });
//   }
// };

// export default handler;
