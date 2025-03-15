const express = require('express');
const cors = require('cors');
const axios = require('axios');
//const jwt = require('jsonwebtoken'); 
const twilio = require('twilio');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt'); // Ensure passwords are securely hashed
require('dotenv').config(); 
const port = process.env.PORT || 2000;
const admin = require('firebase-admin');
const app = express();


const path = require('path');

app.use(express.static(path.join(__dirname, 'shipping-company-client/build')));

// Catch-all route for any other paths (React Router will take over)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'shipping-company-client/build', 'index.html'));
});
// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@shippingcompany.brgvk.mongodb.net/?retryWrites=true&w=majority&appName=ShippingCompany`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true, 
    deprecationErrors: true,
  }
});    
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';


async function run() {   
  try {
    await client.connect(); 
    const db = client.db("SalkeyShipping");
    const usersCollection = db.collection("user");
    const trackingCollection = db.collection("tracking");
    const verificationCollection = db.collection("verification");
    const shipmentsCollection = db.collection('shipments');
    const notificationsCollection = db.collection('notifications');
    const logsCollection = db.collection('admin_logs');
    const newsletterCollection = db.collection("newsletters");
    const shippingAddressCollection = db.collection("shipping_address");
    const ratesCollection = db.collection('rates');

// Function to generate a unique clientId
const generateClientId = async () => {
  const lastUser = await usersCollection.find().sort({ clientId: -1 }).limit(1).toArray();
  let lastId = lastUser.length > 0 ? parseInt(lastUser[0].clientId.split("-")[1]) : 0;
  return `PXS-${String(lastId + 1).padStart(4, "0")}`;
};


const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token has expired." });
    }
    return res.status(400).json({ error: "Invalid or expired token." });
  }
};




// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./model/salkey-shipping-firebase-adminsdk-fbsvc-773c242776.json")),
  });
}

// Verify Firebase token middleware
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    console.log("Received Token:", token); // Debugging
    const decodedUser = await admin.auth().verifyIdToken(token);
    req.user = decodedUser;
    next();
  } catch (error) {
    console.error("Firebase Token Verification Error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};







 
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();



const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ Allows self-signed certificates
  },
});

const sendEmail = async (email, subject, message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};





// 🟢 Forgot Password - Generate OTP
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found!" });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    // Store OTP in database
    await verificationCollection.updateOne(
      { email },
      { $set: { otp, expiry } },
      { upsert: true }
    );

    // Send email
    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);

    res.json({ message: "OTP sent to your email!" });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// 🟢 Verify OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await verificationCollection.findOne({ email });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP!" });
    }

    if (new Date() > new Date(record.expiry)) {
      return res.status(400).json({ error: "OTP expired!" });
    }

    res.json({ message: "OTP verified. Proceed to reset password." });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// 🟢 Reset Password
app.post("/api/auth/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const record = await verificationCollection.findOne({ email });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP!" });
    }

    if (new Date() > new Date(record.expiry)) {
      return res.status(400).json({ error: "OTP expired!" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in MongoDB
    const result = await usersCollection.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ error: "Failed to update password!" });
    }

    // Now, update the password in Firebase Authentication
    try {
      // Fetch the user UID using the email
      const userRecord = await admin.auth().getUserByEmail(email);

      // Update the user's password in Firebase
      await admin.auth().updateUser(userRecord.uid, {
        password: newPassword, // Set the new password directly
      });

      console.log('Password updated in Firebase');

      // Remove OTP from database after successful reset
      await verificationCollection.deleteOne({ email });

      res.json({ message: "✅ Password reset successful!" });
    } catch (firebaseError) {
      console.error('Error updating password in Firebase:', firebaseError);
      return res.status(500).json({ error: "Failed to update password in Firebase!" });
    }
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});







  

// Initialize nodemailer transport


// Endpoint for getting clients
app.get("/admin/clients", async (req, res) => {
  try {
    const clients = await usersCollection.find().toArray();
    res.json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ error: "Error fetching clients" });
  }
});

// Endpoint for getting subscribed clients
app.get("/admin/subscribed-clients", async (req, res) => {
  try {
    const subscribedClients = await newsletterCollection.find({ isSubscribed: true }).toArray();
    res.json(subscribedClients);
  } catch (err) {
    console.error("Error fetching subscribed clients:", err);
    res.status(500).json({ error: "Error fetching subscribed clients" });
  }
});

// Endpoint for getting pending notifications
// Endpoint for getting shipments with state: "Pending"
// Endpoint for getting shipments with state "Pending" and linking them to clients
app.get("/admin/pending-shipments", async (req, res) => {
  try {
    // Fetch shipments where the state is 'Pending'
    const pendingShipments = await shipmentsCollection.aggregate([
      {
        $match: { state: 'Pending' }
      },
      {
        $lookup: {
          from: "user",
          localField: "clientId", // Assuming the clientId is stored in the shipment document
          foreignField: "clientId", // Assuming client IDs are stored as ObjectId
          as: "clientInfo"
        }
      },
      {
        $unwind: "$clientInfo" // Unwind the array to link client info
      }
    ]).toArray();
    
    res.json(pendingShipments);
  } catch (err) {
    console.error("Error fetching pending shipments:", err);
    res.status(500).json({ error: "Error fetching pending shipments" });
  }
});
// Endpoint for saving sent email information
app.post("/admin/send-email", async (req, res) => {
  const { recipients, subject, message } = req.body;

  try {
    // Validate recipients: Check if recipients array is valid and not empty
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "Recipients array is required and must contain at least one email address." });
    }

    // Log recipients for debugging
    console.log("Recipients:", recipients);

    // Loop through the recipients and send the email to each one
    for (const recipientId of recipients) {
      try {
        // Fetch the user's email address based on the recipientId (ObjectId)
        const recipient = await usersCollection.findOne({ _id: new ObjectId(recipientId) });

        // If the recipient is not found or doesn't have an email address, skip
        if (!recipient || !recipient.email) {
          console.warn(`Skipping invalid recipient ID: ${recipientId}`);
          continue;
        }

        const recipientEmail = recipient.email;

        // Send email using nodemailer
        await sendEmail(recipientEmail, subject, message);
        console.log(`Email sent to ${recipientEmail}`);
        
      } catch (error) {
        console.error(`Error sending email to recipient ID ${recipientId}:`, error);
        // Continue sending to other recipients even if one fails
      }
    }

    // Save sent email to notifications collection
    const emailData = {
      recipients,
      subject,
      message,
      timestamp: new Date().toLocaleString(),
      status: 'Sent',
    };

    await notificationsCollection.insertOne(emailData);

    res.status(200).json({ message: "Email(s) sent successfully!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Endpoint to update shipment status
app.patch("/admin/update-shipment-status", async (req, res) => {
  const { packageId, newStatus } = req.body; // Expecting packageId and newStatus in the request body

  try {
    // Validate inputs
    if (!packageId || !newStatus) {
      return res.status(400).json({ error: "Package ID and new status are required." });
    }

    // Find the shipment by its packageId and update the status
    const result = await shipmentsCollection.updateOne(
      { packageId: packageId },  // Use packageId to find the shipment
      { $set: { state: newStatus } }  // Update the state field with the new status
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Package not found or status already updated." });
    }

    res.status(200).json({ message: `Package status updated to ${newStatus} successfully!` });
  } catch (err) {
    console.error("Error updating shipment status:", err);
    res.status(500).json({ error: "Failed to update shipment status" });
  }
});








// Endpoint for getting sent notifications
app.get("/admin/notifications", async (req, res) => {
  try {
    const sentNotifications = await notificationsCollection.find({ status: 'sent' }).toArray();
    res.json(sentNotifications);
  } catch (err) {
    console.error("Error fetching sent notifications:", err);
    res.status(500).json({ error: "Error fetching sent notifications" });
  }
});

// Endpoint for sending emails



// Endpoint for sending pending notifications
app.post("/admin/send-pending-notifications", async (req, res) => {
  const pendingNotifications = req.body;

  try {
    for (let notification of pendingNotifications) {
      const { recipients, subject, message } = notification;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipients,
        subject: subject,
        text: message,
      };

      await transporter.sendMail(mailOptions);

      // Update notification status to 'sent'
      await notificationsCollection.updateOne(
        { _id: notification._id },
        { $set: { status: 'sent', sentAt: new Date() } }
      );
    }

    res.json({ success: true, message: "Pending notifications sent successfully" });
  } catch (err) {
    console.error("Error sending pending notifications:", err);
    res.status(500).json({ error: "Failed to send pending notifications" });
  }
});

// Endpoint for sending subscription notifications
app.post("/admin/send-subscription-notifications", async (req, res) => {
  const { recipients, subject, message } = req.body;

  try {
    // Sending emails
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients,
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Subscription notifications sent successfully" });
  } catch (err) {
    console.error("Error sending subscription notifications:", err);
    res.status(500).json({ error: "Failed to send subscription notifications" });
  }
});






app.post("/admin/shipments", async (req, res) => {
  try {
    const newShipment = req.body;

    // Validate required fields
    if (!newShipment.weight || !newShipment.unit) {
      return res.status(400).json({ error: "Weight and unit are required" });
    }

    // Fetch rates from the database
    const rates = await ratesCollection.findOne();
    if (!rates) {
      return res.status(400).json({ error: "Shipping rates not set" });
    }

    // Calculate the cost dynamically based on unit
    const unitRates = {
      kg: rates.perKg,
      lb: rates.perPound,
    };

    if (!unitRates[newShipment.unit]) {
      return res.status(400).json({ error: "Invalid unit for weight" });
    }

    newShipment.cost = unitRates[newShipment.unit] * newShipment.weight;

    // Set status to "Pending"
    newShipment.state = "Pending";

    // Generate Package ID
    newShipment.packageId = await generatePackageId();

    // Insert the new shipment
    const result = await shipmentsCollection.insertOne(newShipment);

    if (!result.acknowledged) {
      return res.status(500).json({ error: "Failed to create shipment" });
    }

    newShipment._id = result.insertedId;
    res.status(201).json({ shipment: newShipment });
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.put("/admin/shipments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid shipment ID" });
    }

    let updatedShipmentData = req.body;
    
    // Validate required fields
    if (!updatedShipmentData.weight || !updatedShipmentData.unit) {
      return res.status(400).json({ error: "Weight and unit are required" });
    }

    // Fetch rates from the database
    const rates = await ratesCollection.findOne();
    if (!rates) {
      return res.status(400).json({ error: "Shipping rates not set" });
    }

    // Calculate cost if weight and unit are provided
    let cost = 0;
    if (updatedShipmentData.unit === "kg") {
      cost = rates.perKg * updatedShipmentData.weight;
    } else if (updatedShipmentData.unit === "lb") {
      cost = rates.perPound * updatedShipmentData.weight;
    } else {
      return res.status(400).json({ error: "Invalid unit for weight" });
    }
    updatedShipmentData.cost = cost;

    // Set the status to "Pending" after update
    updatedShipmentData.state = "Pending";

    // Exclude `_id` from update object
    const { _id, ...updateFields } = updatedShipmentData;
    const objectId = new ObjectId(id);

    // Ensure the shipment exists before updating
    const shipment = await shipmentsCollection.findOne({ _id: objectId });
    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    // Update shipment in the database
    const result = await shipmentsCollection.updateOne(
      { _id: objectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    // Fetch the updated shipment
    const updatedShipment = await shipmentsCollection.findOne({ _id: objectId });

    res.json({ shipment: updatedShipment });
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(500).json({ error: "Failed to update shipment" });
  }
});














































// Admin Login Route
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    if (user.role !== "adminuser") return res.status(403).json({ success: false, message: "Unauthorized" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // Generate OTP
    const otpCode = generateOTP();
    await verificationCollection.insertOne({ email, code: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }); // Expires in 5 minutes

    // Send OTP to email
    await sendEmail(email, "Your Admin Login OTP", `Your OTP is: ${otpCode}`);

    return res.json({ success: true, message: "OTP sent to email", email });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// OTP Verification Route
app.post("/admin/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await verificationCollection.findOne({ email, code: otp, expiresAt: { $gt: new Date() } });

    if (!otpRecord) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    // Delete OTP after successful verification
    await verificationCollection.deleteOne({ email, code: otp });

    // Generate JWT Token
    const user = await usersCollection.findOne({ email });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.json({ success: true, token, user });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// **Send Email Verification Route**
app.post("/api/send-email-verification", async (req, res) => {
  const { email } = req.body;

  try {
    // ✅ Check if the email is already verified
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    // ✅ Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // ✅ Save OTP in a verification collection (so the user can verify later)
    await verificationCollection.insertOne({ email, code: otp, expiresAt });

    // ✅ Send the OTP email
    await sendEmail(email, "Email Verification Code", `Your verification code is: ${otp}`);

    res.json({ success: true, message: "Verification code sent successfully." });
  } catch (error) {
    console.error("Error sending email verification:", error);
    res.status(500).json({ success: false, message: "Failed to send verification email." });
  }
});


// **Verify Email Route**
app.post("/api/verify-email", async (req, res) => {
  const { email, code } = req.body;

  try {
    const otpRecord = await verificationCollection.findOne({ email, code, expiresAt: { $gt: new Date() } });

    if (!otpRecord) return res.status(400).json({ verified: false, message: "Invalid or expired code." });

    // Delete OTP after verification
    await verificationCollection.deleteOne({ email, code });

    return res.json({ verified: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ verified: false, message: "Verification failed." });
  }
});














// USER LOGIN
// 🟢 User Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("🔹 Auth Login Request!");

  try {
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ error: "Use Google login instead" });
    }

    console.log("🔹 Entered Password:", password);
    console.log("🔹 Stored Hashed Password:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔹 Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { clientId: user.clientId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      clientId: user.clientId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      companyName: user.companyName,
      address: user.address,
      servicePreferences: user.servicePreferences,
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/auth/google-login', async (req, res) => {
  const { email, firstName, lastName } = req.body;

  try {
    const user = await usersCollection.findOne({ email });

    if (user) {
      if (user.password) {
        return res.status(400).json({ error: "This email is already registered using email/password. Use email login instead." });
      }
      return res.json({ clientId: user.clientId, message: "Google login successful" });
    }

    const clientId = await generateClientId();

    const newUser = {
      clientId,
      email,
      firstName,
      lastName,
      isEmailVerified: true,
    };

    await usersCollection.insertOne(newUser);

    res.status(201).json({ clientId, message: "Google signup successful, please complete your profile." });

  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/api/check-email', async (req, res) => {
  const { email } = req.query;
  const user = await usersCollection.findOne({ email });
  res.json({ exists: !!user });
});

 
// User signup
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, firstName, lastName, phone, companyName, address, servicePreferences } = req.body;
  try {
    let user = await usersCollection.findOne({ email });
    if (user) return res.status(400).json({ error: "Email already in use!" });
    const clientId = await generateClientId();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const globalShippingAddress = await shippingAddressCollection.findOne();
    const userShippingAddress = globalShippingAddress ? `${firstName} ${lastName}, ${globalShippingAddress.address}` : "";
    user = {
      clientId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      isPhoneVerified: false,
      isEmailVerified: true,
      companyName: companyName || null,
      address,
      servicePreferences,
      shippingAddress: userShippingAddress,
      role: "client"
    };
    await usersCollection.insertOne(user);
    res.status(201).json({ clientId, message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


       
  
 
 
















// Get all shipments
app.get("/admin/shipments", async (req, res) => {
  try {
    const shipments = await shipmentsCollection.find().toArray();
    res.json(shipments);
  } catch (error) {
    console.error("Error fetching shipments:", error);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

// Backend function to generate Package ID
const generatePackageId = async () => {
  // Sort by _id to get the most recently added package
  const lastPackage = await shipmentsCollection.find().sort({ _id: -1 }).limit(1).toArray();
  
  // Extract the numeric part of the last package ID and increment by 1
  let lastId = lastPackage.length > 0 ? parseInt(lastPackage[0].packageId.split("-")[1]) : 0;

  // Generate a new package ID in the format PKG-0001, PKG-0002, etc.
  return `PKG-${String(lastId + 1).padStart(4, "0")}`;
};





// Delete a shipment
app.delete("/admin/shipments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await shipmentsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }
    res.json({ message: "Shipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    res.status(500).json({ error: "Failed to delete shipment" });
  }
});





app.delete("/api/user-info", verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email; // Assuming email is available in the decoded JWT (req.user)

    // Step 1: Delete the user from Firebase Authentication using email
    await admin.auth().getUserByEmail(userEmail)
      .then((userRecord) => {
        return admin.auth().deleteUser(userRecord.uid); // Use the Firebase UID to delete the user
      })
      .catch((error) => {
        throw new Error(`Failed to delete user from Firebase: ${error.message}`);
      });

    // Step 2: Delete the user from MongoDB using the email
    const result = await usersCollection.deleteOne({ email: userEmail }); // Find by email in MongoDB

    if (!result.deletedCount) {
      return res.status(404).json({ message: "User not found in database" });
    }

    // Respond with success
    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error); // Log the error for debugging
    res.status(500).json({ message: "Error deleting user account", error: error.message });
  }
});



// Get Rates
app.get("/api/rates", async (req, res) => {
  try {
    const rates = await ratesCollection.findOne();
    if (!rates) {
      return res.status(404).json({ error: "Rates not set" });
    }
    res.json({ perPound: rates.perPound || 0, perKg: rates.perKg || 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rates" });
  }
});

// Update Rates (Admin Only)
app.put("/api/admin/rates", verifyToken, async (req, res) => {
  if (req.user.role !== "adminuser") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  let { perPound, perKg } = req.body;

  if (!perPound || !perKg || isNaN(perPound) || isNaN(perKg)) {
    return res.status(400).json({ error: "Invalid rate values" });
  }

  perPound = parseFloat(perPound);
  perKg = parseFloat(perKg);

  try {
    await ratesCollection.updateOne({}, { $set: { perPound, perKg } }, { upsert: true });
    res.json({ message: "Rates updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update rates" });
  }
});

// Calculate Cost
app.post("/api/calculate-cost", async (req, res) => {
  try {
    let { weight, unit } = req.body;

    if (!weight || isNaN(weight)) {
      return res.status(400).json({ error: "Invalid weight value" });
    }

    weight = parseFloat(weight);

    const rates = await ratesCollection.findOne();
    if (!rates) {
      return res.status(404).json({ error: "Rates not set" });
    }

    let cost;
    if (unit === "kg") {
      cost = weight * rates.perKg;
    } else if (unit === "lb") {
      cost = weight * rates.perPound;
    } else {
      return res.status(400).json({ error: "Invalid unit" });
    }

    res.json({ cost: cost.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate cost" });
  }
});

// Admin sets global shipping address
app.post("/api/admin/shipping-address", verifyToken, async (req, res) => {
  if (req.user.role !== "adminuser") return res.status(403).json({ error: "Unauthorized" });
  const { address } = req.body;
  await shippingAddressCollection.updateOne({}, { $set: { address } }, { upsert: true });
  res.json({ message: "Shipping address updated successfully" });
});

// Admin sets or updates global shipping address
app.put("/api/admin/shipping-address", verifyToken, async (req, res) => {
  if (req.user.role !== "adminuser") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { addressLine1, addressLine2, city, state, zipCode, country } = req.body;

  const shippingAddress = {
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    country,
  };

  await shippingAddressCollection.updateOne(
    {},
    { $set: { address: shippingAddress } }, // Store as an object
    { upsert: true }
  );

  res.json({ message: "Shipping address updated successfully" });
});

// Fetch global shipping address
app.get("/api/admin/shipping-address", async (req, res) => {
  const result = await shippingAddressCollection.findOne();

  if (!result || !result.address) {
    return res.json({
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    });
  }

  res.json(result.address); // Send only the address object
});



























  





 


app.get('/api/user-shipments', verifyToken, async (req, res) => {
  try {
    const { clientId } = req.user;
    const shipments = await shipmentsCollection.find({ clientId }).toArray();

    // Always return an empty array instead of a 404 error
     // Log the response to ensure status is an array
     console.log("Shipments fetched from DB:", shipments); 

    res.json(shipments);

  } catch (error) {
    console.error("Error fetching shipments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/api/package/:packageId', verifyToken, async (req, res) => {
  try {
    const { packageId } = req.params;
    const packageDetails = await shipmentsCollection.findOne({ packageId });

    if (!packageDetails) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json(packageDetails);
  } catch (error) {
    console.error("Error fetching package details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


    // Fetch user information
    app.get("/api/user-info", verifyToken, async (req, res) => {
      try {
        const user = await usersCollection.findOne({ clientId: req.user.clientId });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
          clientId: user.clientId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          companyName: user.companyName,
          address: user.address,
          servicePreferences: user.servicePreferences,
         // shippingAddress: user.shippingAddress,
        });
      } catch (error) {
        res.status(500).json({ message: "Server error", error });
      }
    });

// Update user information
app.put("/api/user-info", verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, companyName, servicePreferences } = req.body;

    // Check if the address field exists and is not empty
    if (!address) {
      return res.status(400).json({ message: "Address field is required" });
    }

    // Prepare the update fields
    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address; // Ensure address is updated
    if (companyName !== undefined) updateFields.companyName = companyName;
    if (servicePreferences !== undefined) updateFields.servicePreferences = servicePreferences;

    const result = await usersCollection.updateOne(
      { clientId: req.user.clientId },
      { $set: updateFields }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ message: "No changes made or user not found" });
    }

    res.json({ message: "User information updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user information", error });
  }
});




// Delete user account endpoint
// Delete user account
app.delete("/api/user-info", verifyToken, async (req, res) => {
  try {
    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(req.user.uid); // Firebase UID

    // Delete user from MongoDB
    const result = await usersCollection.deleteOne({ firebaseUid: req.user.uid });

    if (!result.deletedCount) {
      return res.status(404).json({ message: "User not found in database" });
    }

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user account", error });
  }
});



app.get('/api/stats', verifyToken, async (req, res) => {
  try {
    const { clientId } = req.user;  // Extract clientId from the JWT token
    
    // Fetch shipments for the user from the 'shipments' collection
    const shipments = await shipmentsCollection.find({ clientId }).toArray();

    // Initialize statistics counters
    let totalShipments = 0;
    let delivered = 0;
    let processing = 0;
    let inTransit = 0;

    if (shipments.length > 0) {
      // Loop through each shipment and categorize them based on the latest status
      shipments.forEach(shipment => {
        totalShipments++;

        // Ensure shipment.status is an array and contains elements before proceeding
        if (Array.isArray(shipment.status) && shipment.status.length > 0) {
          // Get the latest status by sorting the status array by date (most recent first)
          const latestStatus = shipment.status.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

          // Update counters based on the latest status
          switch (latestStatus.status) {
            case 'Delivered':
              delivered++;
              break;
            case 'At Warehouse':
            case 'At Custom Facility':
            case 'At Company Office':
            case 'Ready for Pickup':
              processing++;
              break;
            case 'Out for Delivery':
            case 'In Transit':
              inTransit++;
              break;
            default:
              break;
          }
        } else {
          console.warn(`Skipping shipment ${shipment._id} because status is invalid or empty`);
        }
      });
    }

    // Return the stats as a response, even if all values are zero
    res.json({
      totalShipments,
      delivered,
      processing,
      inTransit,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




















 
 
 


// GET all users (Admin Only)
app.get('/admin/users', async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}); 

// GET a single user by ID
app.get('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// UPDATE a user
app.put('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!updatedUser.value) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser.value);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE a user
app.delete('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});


// 🔹 Subscribe to Newsletter
app.post('/api/newsletter/subscribe', async (req, res) => {
  const { email } = req.body;

  // Validate email format
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format." });
  }

  try {
    // Check if the email already exists
    const existingSubscriber = await newsletterCollection.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ success: false, message: "Email already subscribed." });
    }

    // Insert new subscriber
    await newsletterCollection.insertOne({ email });
    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Error subscribing email:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

















// Add an entry to the admin logs collection
const logAdminAction = async (action, userEmail, status, details) => {
  const logEntry = {
    action,
    userEmail,
    status,
    details,
    timestamp: new Date(),
  };
  await db.collection('admin_logs').insertOne(logEntry);
};























 // Dashboard Overview API
 app.get('/api/admin/dashboard', async (req, res) => {
  try {
    // Get the total number of shipments, users, notifications, and logs
    const totalShipments = await shipmentsCollection.countDocuments();
    const totalUsers = await usersCollection.countDocuments();
    const totalNotifications = await notificationsCollection.countDocuments();
    const totalLogs = await logsCollection.countDocuments();

    // Send the data back as a response
    res.json({
      shipments: totalShipments,
      users: totalUsers,
      notifications: totalNotifications,
      logs: totalLogs,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});












 

















































    // TRACKING API (Ship24 integration)
    app.get('/track/:trackingNumber', async (req, res) => {
      const { trackingNumber } = req.params;

      try {
        let existingTracking = await trackingCollection.findOne({ trackingNumber });
        if (existingTracking) {
          return res.json(existingTracking);
        }

        const response = await axios.get(`https://api.ship24.com/public/v1/trackers/${trackingNumber}`, {
          headers: { Authorization: `Bearer ${process.env.SHIP24_API_KEY}` }
        });

        const newTracking = await trackingCollection.insertOne({
          trackingNumber,
          status: response.data,
          lastUpdated: new Date(),
        });

        return res.json(newTracking);
      } catch (error) {
        console.error('Ship24 API Error:', error);
        res.status(500).json({ error: "Failed to fetch tracking data" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");

  } finally {
    // Ensure client closes when finished/errors
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Tracking API is up and running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
