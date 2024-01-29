import mongoose from "mongoose";


const campaignSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true, // Provide a default value that makes sense for email
  },
  appPassword: {
    type: String,
    required: true, // Provide a default value that makes sense for appPassword
  },
  subject: {
    type: String,
    required: true, // Provide a default value that makes sense for subject
  },
  body: {
    type: String,
    required: true, // Provide a default value that makes sense for body
  },
  excelFile: {
    type: String,
    required: true, // This line makes the field required
  },
  schedulingData: {
    type: String,
    required: true, // Provide a default value that makes sense for schedulingData
  },
},
{ timestamps: true }
);

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);

export default  Campaign;
