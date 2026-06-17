import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendGiftEmail = async (req, res) => {
  try {
    const { receiverEmail, message, amount, senderName } = req.body;

    console.log(process.env.EMAIL_USER);
    

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,   // ✅ better name
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"${senderName}" <${process.env.EMAIL_USER}>`, // ✅ FIXED
      to: receiverEmail,
      subject: "🎁 You received a Gift Card!",
        html: `
  <div style="font-family: Arial, sans-serif; background:#f3f4f6; padding:20px">
    
    <div style="max-width:500px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1)">
      
      <!-- Header -->
      <div style="background:#f59e0b; color:white; padding:15px; text-align:center">
        <h1 style="margin:0;">🎁 Gift Card</h1>
      </div>

      <!-- Image -->
      <img src="${req.body.design}" 
           alt="gift" 
           style="width:100%; height:200px; object-fit:cover"/>

      <!-- Content -->
      <div style="padding:20px; text-align:center">
        
        <h2 style="color:#111;">₹${amount}</h2>
        
        <p style="color:#555; font-size:16px;">
          ${message || "Enjoy your gift!"}
        </p>

        <p style="margin-top:20px; font-weight:bold;">
          From ❤️ ${senderName}
        </p>

        <!-- Button -->
        <a href="#" 
           style="display:inline-block; margin-top:20px; padding:12px 20px; background:#10b981; color:white; text-decoration:none; border-radius:8px;">
          Redeem Now
        </a>

      </div>

      <!-- Footer -->
      <div style="background:#f9fafb; padding:10px; text-align:center; font-size:12px; color:#888">
        This is a digital gift card 🎉
      </div>

    </div>

  </div>
`
    });

    res.json({
      status: true,
      message: "Email sent successfully 🎉"
    });

  } catch (error) {
    console.log("EMAIL ERROR:", error);

    res.status(500).json({
      status: false,
      message: error.message  
    });
  }
};