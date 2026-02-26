const SibApiV3Sdk = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");
const users = require("../models/userModel");
const bcrypt = require("bcrypt");
const forgotpassword = require("../models/ForgotPassworModel");
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API;
const api = new SibApiV3Sdk.TransactionalEmailsApi();

const sendmailTouser = async (req, res) => {
  console.log("BREVO KEY:", process.env.BREVO_API);

  console.log("SendMail hit in controller");
  try {
    const { email } = req.body;
    const requestid = uuidv4();

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const user = await users.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await forgotpassword.create({
      id: requestid,
      userId: user.id,
      isActive: true,
    });

    console.log(requestid, "reqid");
    const resetLink = `${process.env.BASE_URL}/forgot/resetpassword.html?requestId=${requestid}`;
    await api.sendTransacEmail({
      sender: { email: "harmeshmahaur44@gmail.com", name: "ExpenseTracker" },
      to: [{ email }],
      subject: "Forgot Password request",
      htmlContent: ` <h2>Password Reset</h2>
                           <p>Click the link below to reset your password:</p>
                           <a href="${resetLink}" target="_blank">Reset Password</a>
                             <p>This link is valid for 15 minutes.</p>`,
    });
    res.status(200).json({ message: "mail sent to user" });
  } catch (error) {
    console.error("Brevo Error:", error);
    return res.status(500).json({
      message: "Email sending failed",
      error: error.message,
    });
  }
};



const saveNewpassword = async (req, res) => {
  console.log("savenewpass hit");
  try {
    const { password, requestId } = req.body;
    const request = await forgotpassword.findOne({
      where: { id: requestId, isActive: true },
    });

    if (!request) {
      return res.status(400).json({ message: "Invalid or expired request" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await users.update(
      { password: hashedPass },
      { where: { id: request.userId } },
    );

    await forgotpassword.update(
      { isActive: false },
      { where: { id: requestId } },
    );

    res.status(200).json({ message: "Password successfully updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  sendmailTouser,
  saveNewpassword,
};