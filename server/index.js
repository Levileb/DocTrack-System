require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const UserModel = require("./models/User");
const DocModel = require("./models/Document");
const OfficeModel = require("./models/Office");
const ReceivingLogModel = require("./models/ReceivingLogs");
const ForwardingLogModel = require("./models/ForwardingLogs");
const CompletedLogModel = require("./models/CompletedLogs");
const deepEmailValidator = require('deep-email-validator');


const app = express();



// Parse JSON and Cookies
app.use(express.json());
app.use(cookieParser());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')} - Cookies: ${JSON.stringify(req.cookies)}`);
  next();
});

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000", 
  "https://doctrack.onrender.com",
  "https://doctrack-system.onrender.com",
  "https://doc-track-system.vercel.app",
  "https://doctrack-api.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
  })
);


const mongoURI = process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify token
const verifyUser = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;


  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    UserModel.findOne({ email: decoded.email }) // Ensure email is unique
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        req.user = {
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          office: user.office,
          position: user.position,
          email: user.email,
        };

        next();
      })
      .catch((err) => {
        console.error("Error finding user:", err);
        res.status(500).json({ error: "Internal server error" });
      });
  });
};




// NodeMailer
const nodemailer = require("nodemailer");

console.log("Email configuration check:");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "***SET***" : "NOT SET");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      UserModel.findOne({ email: email })
        .then((user) => {
          if (user) {
            if (!user.isVerified) {
              return res.status(403).json({
                Status: "Invalid",
                message: "Account not verified. Please verify your email.",
              });
            }

            // Compare the provided password with the hashed password in the database
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ message: "Internal server error" });
              }

              if (isMatch) {
                // Generate Access Token
                const accessToken = jwt.sign(
                  { email: user.email, role: user.role },
                  JWT_SECRET,
                  { expiresIn: "24h" }
                );

                // Generate Refresh Token (with longer expiry)
                const refreshToken = jwt.sign({ email: user.email }, JWT_SECRET, {
                  expiresIn: "60d",
                });

                res.cookie("accessToken", accessToken, {
                  secure: true, // Use true for HTTPS (required for production)
                  sameSite: "None", // Required for cross-origin cookies
                  path: "/",
                  httpOnly: true, // Prevent XSS attacks
                  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                });
                res.cookie("refreshToken", refreshToken, {
                  secure: true, // Use true for HTTPS (required for production)
                  sameSite: "None", // Required for cross-origin cookies
                  httpOnly: true, // Prevent XSS attacks
                  maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days in milliseconds
                });

                // Respond with the tokens
                return res.json({
                  accessToken,
                  refreshToken,
                  role: user.role,
                  Status: "Success",
                });
              } else {
                return res
                  .status(401)
                  .json({ Status: "Error", message: "Incorrect password" });
              }
            });
          } else {
            return res.status(404).json({ message: "User not found" });
          }
        })
        .catch((err) => {
          res.status(500).json({ message: "Internal server error" });
        });
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
      res.status(500).json({ message: "Database connection error" });
    });
});

// API for Refresh Token
app.post("/api/refresh-token", (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token is missing" });
  }

  // Verify the refresh token
  jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "24h" } // Short expiration for the new access token
    );

    // Send the new access token as a cookie or JSON response
    res.cookie("accessToken", newAccessToken, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    return res.json({ accessToken: newAccessToken });
  });
});

// API for Viewing All User Details
app.get("/api/user/details", verifyUser, (req, res) => {
  const { firstname, lastname, role, email, position, office } = req.user;
  // console.log({ firstname, lastname, role, email, position, office });
  res.json({ firstname, lastname, role, email, position, office });
});

// API for Viewing Specific User by ID
app.get("/api/user/details/:userId", verifyUser, (req, res) => {
  const userId = req.params.userId;

  // Find the user by ID in the database
  UserModel.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Send the user details in the response
      res.json(user);
    })
    .catch((err) => {
      console.error("Error fetching user details:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// Endpoint to fetch all users
app.get("/view-user", (req, res) => {
  UserModel.find()
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// New route to archive a user
app.post("/archive-user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    await UserModel.findByIdAndUpdate(userId, { isArchived: true });
    res.status(200).json({ message: "User archived successfully." });
  } catch (error) {
    console.error("Error archiving user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to fetch archived users
app.get("/archived-users", async (req, res) => {
  try {
    const archivedUsers = await UserModel.find({ isArchived: true });
    res.status(200).json(archivedUsers);
  } catch (error) {
    console.error("Error fetching archived users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// New route to restore a user
app.post("/restore-user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    await UserModel.findByIdAndUpdate(userId, { isArchived: false });
    res.status(200).json({ message: "User restored successfully." });
  } catch (error) {
    console.error("Error restoring user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch all documents
app.get("/api/docs", (req, res) => {
  DocModel.find()
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      console.error("Error fetching documents:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// API for fetching sent documents by logged in user
app.get("/api/docs/sent", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;

  try {
    const sentDocuments = await DocModel.find({
      user_id: loggedInUserId,
    })
      .populate("_id", "date title codeNumber sender originating ")
      .exec();

    if (sentDocuments.length === 0) {
      return res.status(404).json("No sent documents found");
    }

    const documents = sentDocuments.map((doc) => ({
      _id: doc._id,
      date: doc.date,
      title: doc.title,
      sender: doc.sender,
      originating: doc.originating,
      recipient: doc.recipient,
      destination: doc.destination,
      codeNumber: doc.codeNumber,
      remarks: doc.remarks,
      status: doc.status,
    }));

    res.json(documents);
  } catch (err) {
    console.error("Error fetching sent documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch the logged-in user's information
app.get("/api/user/find-user", verifyUser, async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // Get the logged-in user's ID from the request
    const user = await UserModel.findById(loggedInUserId).select("-password"); // Exclude the password field for security
    // console.log("Current User: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const fullName = `${user.firstname} ${user.lastname}`;

    res.status(200).json(fullName); // Send the user's information as a response
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// API for fetching documents sent to the logged in user
app.get("/api/docs/inbox", verifyUser, async (req, res) => {
  const loggedInUserFullName = `${req.user.firstname} ${req.user.lastname}`;
  // console.log("Fetching documents for user ID:", loggedInUserFullName);

  try {
    const documents = await DocModel.find({
      recipient: { $regex: new RegExp(`\\b${loggedInUserFullName}\\b`, "i") },
    })
      .populate(
        "_id",
        "date title codeNumber sender originating recipient destination"
      )
      .exec();

    if (documents.length === 0) {
      return res.status(404).json("No documents found");
    }

    const formattedDocuments = documents.map((doc) => ({
      _id: doc._id,
      date: doc.date,
      title: doc.title,
      sender: doc.sender,
      originating: doc.originating,
      recipient: doc.recipient,
      destination: doc.destination,
      codeNumber: doc.codeNumber,
      remarks: doc.remarks,
      status: doc.status,
    }));

    res.json(formattedDocuments);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API for fetching documents received by the logged in user
app.get("/api/docs/received", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;

  try {
    const forwardingLogs = await ForwardingLogModel.find({
      forwardedTo: loggedInUserId,
    })
      .populate("doc_id", "date forwardedAt title codeNumber status")
      .populate({
        path: "user_id",
        select: "firstname lastname",
      })
      .exec();

    if (forwardingLogs.length === 0) {
      return res.status(404).json({ message: "No forwarded documents found" });
    }

    const documents = forwardingLogs.map((log) => ({
      docId: log._id,
      date: log.forwardedAt,
      title: log.doc_id.title,
      sender: `${log.user_id.firstname} ${log.user_id.lastname}`,
      remarks: log.remarks,
      status: log.doc_id.status,
      codeNumber: log.doc_id.codeNumber,
    }));
    res.json(documents);
  } catch (err) {
    console.error("Error fetching forwarded documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API for fetching documents forwarded by the logged in user
app.get("/api/docs/forwarded", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;

  try {
    const forwardingLogs = await ForwardingLogModel.find({
      user_id: loggedInUserId,
    })
      .populate("doc_id", "date forwardedAt title codeNumber status") // Populate the document details
      .populate("forwardedTo", "firstname lastname") // Populate the first and last name of the recipient
      .exec();

    if (forwardingLogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No documents forwarded by the user" });
    }

    // Constructing the response
    const documents = forwardingLogs.map((log) => ({
      docId: log._id,
      date: log.forwardedAt,
      title: log.doc_id.title,
      forwardedTo: `${log.forwardedTo.firstname} ${log.forwardedTo.lastname}`, // Combine the first and last name
      remarks: log.remarks,
      status: log.doc_id.status,
      codeNumber: log.doc_id.codeNumber,
    }));

    res.json(documents);
  } catch (err) {
    console.error("Error fetching forwarded documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API for fetching documents marked as completed
app.get("/api/docs/completed", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;

  try {
    // Fetch completed logs where the user is either the one who completed the document or the sender
    const completedLogs = await CompletedLogModel.find({
      userId: loggedInUserId,
    })
      .populate("docId", "date title completedAt sender recipient")
      .exec();

    if (completedLogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No documents completed by the user" });
    }

    // Constructing the response
    const completedDocuments = completedLogs.map((log) => ({
      completedAt: log.completedAt,
      title: log.docId.title,
      docId: log.docId._id,
      date: log.docId.date,
      remarks: log.remarks,
      sender: log.docId.sender,
      recipient: log.docId.recipient,
    }));

    res.json(completedDocuments);
  } catch (err) {
    console.error("Error fetching completed documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch a single document by its ID
app.get("/api/docs/:docId", verifyUser, (req, res) => {
  const docId = req.params.docId;

  // Find the document by ID in the database
  DocModel.findById(docId)
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      // Send the document details in the response
      res.json(doc);
    })
    .catch((err) => {
      console.error("Error fetching document:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// Endpoint to update a document
app.put("/api/docs/:docId", verifyUser, (req, res) => {
  const docId = req.params.docId;

  // Update the document in the database
  DocModel.findByIdAndUpdate(docId, req.body, { new: true })
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(doc);
    })
    .catch((err) => res.status(500).json({ error: "Internal server error" }));
});

// Endpoint to fetch a user by ID
app.get("/getUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findById({ _id: id })
    .then((user) => res.json(user))
    .catch((err) => res.json(err));
});

// Endpoint to update a user information
app.put("/updateUser/:id", (req, res) => {
  const id = req.params.id;

  // Convert id string to MongoDB ObjectId
  const ObjectId = mongoose.Types.ObjectId;

  UserModel.findByIdAndUpdate(
    { _id: new ObjectId(id) }, // Convert id string to ObjectId
    { $set: req.body }, // Update all fields from the request body
    { new: true } // Return the updated document
  )
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const uniqueID = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit ID

      // Compose the email
      const mailOptions = {
        from: '"DocTrack-System" <doctracks.kabankalan@gmail.com>',
        to: user.email,
        subject: "Profile Updated Successfully",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; text-align: center;">
            <div style="padding: 20px;">
              <h2>Your Information has been Updated!</h2>
              <p>Hello <strong>${user.firstname}</strong>,</p>
              <p>Your profile details in the Document Tracking System have been updated. If you did not make this request, please report it to the Administrator's Office.</p>
            </div>
            <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; color: #777;">
              <p style="margin: 0;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        `,
        headers: {
          "X-Unique-ID": uniqueID.toString(), // Custom unique identifier
          "In-Reply-To": `<${new Date().getTime()}@doctracks.kabankalan.com>`, // Unique for each email
        },
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
          return res.status(500).json({ error: "Failed to send email" });
        }
        console.log("Email sent:", info.response);
        res.json({ message: "User updated and email sent", user });
      });
    })
    .catch((err) => res.status(500).json({ error: "Internal server error" }));
});

// Generate a verification token
function generateVerificationToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

//Check Email Validity
const isEmailValid = async (email) => { 
if (email.endsWith(".gov.ph") || email.endsWith(".edu.ph")) {
  return { valid: true }; // Skip validation for .gov.ph and .edu.ph domains
}

  const result = await deepEmailValidator.validate({
    email: email,
    sender: email, // Optional, but improves accuracy
    validateRegex: true,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: true, 
  });

  return result;
};
// Endpoint for forgot password
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a reset password token
    const resetToken = generateVerificationToken(user._id);

    // Save the reset token and its expiration in the user's record
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Set up reset password link
    const resetUrl = `https://doc-track-system.vercel.app/reset-password?token=${resetToken}`;
    console.log("Reset Password URL: ", resetUrl);

    const uniqueID = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit ID

    // Send reset password email
    const mailOptions = {
      from: '"DocTrack-System" <doctracks.kabankalan@gmail.com>',
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; text-align: center;">
          <div style="padding: 20px;">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Click the link below to reset it:</p>
            <a href="${resetUrl}" style="padding: 10px 20px; background-color: #129bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
          </div>
          <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            <p style="margin: 0;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
      headers: {
        "X-Unique-ID": uniqueID.toString(), // Custom unique identifier
        "In-Reply-To": `<${new Date().getTime()}@doctracks.kabankalan.com>`, // Unique for each email
      },
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending reset password email" });
      } else {
        console.log("Reset password email sent:", info.response);
        res.json({
          message: "Reset password email sent successfully. Please check your inbox.",
        });
      }
    });
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  try {
    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    console.log("Saved Token:", user.resetToken);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.resetToken || user.resetToken !== token || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to add a new user
app.post("/add-user", async (req, res) => {
  const { firstname, lastname, email, password, position, office } = req.body;

  if (!email || !password || !firstname || !lastname) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Email validation removed - accept any email format

  bcrypt
  .hash(password, 10)
  .then((hash) => {
    // Create a new user with isVerified set to false
    UserModel.create({
      firstname,
      lastname,
      email,
      password: hash,
      position,
      office,
      isVerified: false, // New field to track verification status
    })
      .then((user) => {
        // Generate verification token
        const verificationToken = generateVerificationToken(user._id);
        console.log("Verification Token: ", verificationToken);
        

       
        // Set up verification link
        const verificationUrl = `https://doc-track-system.vercel.app/verify-email?token=${verificationToken}`;
        console.log("Verification URL: ", verificationUrl);

        const uniqueID = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit ID

        // Send verification email
        const mailOptions = {
          from: '"DocTrack-System" <doctracks.kabankalan@gmail.com>',
          to: email,
          subject: "Email Verification",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; text-align: center;">
              <div style="padding: 20px;">
                <h2>Welcome to our Document Tracking System!</h2>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #129bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>If you did not sign up, please ignore this email.</p>
              </div>
              <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                <p style="margin: 0;">This is an automated message, please do not reply.</p>
              </div>
             </div>
          `,
          headers: {
            "X-Unique-ID": uniqueID.toString(), // Custom unique identifier
            "In-Reply-To": `<${new Date().getTime()}@doctracks.kabankalan.com>`, // Unique for each email
          },
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return res
              .status(500)
              .json({ error: "Error sending verification email" });
          } else {
            console.log("Verification email sent:", info.response);
            res.json({
              message: "User added successfully. Please verify your email.",
            });
          }
        });
      })
      .catch((err) =>
        res.status(500).json({ error: "Internal server error" })
      );
  })
  .catch((err) => {
    console.error("Error hashing password:", err);
    res.status(500).json({ error: "Internal server error" });
  });
  });

// Endpoint to verify user email
app.get("/verify-email", async (req, res) => {
  const token = req.query.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log(decoded);

    const user = await UserModel.findById(userId);
    if (!user) return res.status(400).send("Invalid verification link");

    if (user.isVerified) {
      // User already verified
      return res.redirect("https://doc-track-system.vercel.app");
    }

    // Mark the user as verified
    user.isVerified = true;
    await user.save();

    // Redirect to login page or success page
    res.redirect("https://doc-track-system.vercel.app"); // Use a query param to show a success message
  } catch (error) {
    res.status(400).send("Invalid or expired token");
  }
});

// Endpoint to update user password
app.post("/api/user/update-password", verifyUser, (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  console.log("Received request to update password for user:", req.user._id);

  // Hash the new password
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      // Update the user's password in the database
      UserModel.findByIdAndUpdate(
        req.user._id,
        { password: hash },
        { new: true }
      )
        .then((updatedUser) => {
          if (!updatedUser) {
            console.log("User not found or update failed");
            return res.status(404).json({ error: "User not found" });
          }
          console.log(
            "Password updated successfully for user:",
            updatedUser._id
          );
          res.json({ message: "Password updated successfully" });
        })
        .catch((err) => {
          console.error("Error updating password in database:", err);
          res.status(500).json({ error: "Internal server error" });
        });
    })
    .catch((err) => {
      console.error("Error hashing password:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// Endpoint to create a new office
app.post("/add-office", (req, res) => {
  const { office } = req.body;

  // Create a new document using the DocModel
  OfficeModel.create({ office })
    .then((office) => res.json("Success"))
    .catch((err) => res.json(err));
});

// Endpoint to fetch all offices
app.get("/offices", (req, res) => {
  OfficeModel.find()
    .then((offices) => {
      res.json(offices);
    })
    .catch((err) => {
      console.error("Error fetching offices:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// Endpoint to archive an office
app.post("/archive-office/:id", (req, res) => {
  const officeId = req.params.id;

  OfficeModel.findByIdAndUpdate(officeId, { isArchived: true }, { new: true })
    .then((updatedOffice) => res.json(updatedOffice))
    .catch((err) =>
      res.status(500).json({ error: "Failed to archive office" })
    );
});

// Endpoint to restore an office
app.post("/restore-office/:id", (req, res) => {
  const officeId = req.params.id;

  OfficeModel.findByIdAndUpdate(officeId, { isArchived: false }, { new: true })
    .then((updatedOffice) => res.json(updatedOffice))
    .catch((err) =>
      res.status(500).json({ error: "Failed to restore office" })
    );
});

// Route to fetch archived offices
app.get("/archived-offices", async (req, res) => {
  try {
    const archivedOffices = await OfficeModel.find({ isArchived: true });
    res.status(200).json(archivedOffices);
  } catch (error) {
    console.error("Error fetching archived offices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to update a document status
app.post("/api/docs/update-status", async (req, res) => {
  try {
    const { docId, status } = req.body; // Accept the status as a parameter
    await DocModel.findByIdAndUpdate(docId, { status: status });
    res.status(200).json({ message: "Document status updated successfully." });
  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update the backend endpoint to match the frontend request
app.get("/api/receivingLogs", verifyUser, async (req, res) => {
  try {
    // Fetch receiving logs data from the database
    const logs = await ReceivingLogModel.find({
      user_id: req.user.id,
    }).populate("doc_id"); // Populate the document details

    // Send the receiving logs data in the response
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching receiving logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new receiving log
app.post("/api/docs/log-receipt", verifyUser, (req, res) => {
  console.log(req.user); // This should log the authenticated user

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { docId, remarks } = req.body;

  const newReceivingLog = new ReceivingLogModel({
    user_id: req.user._id, // Attach the user_id from the logged-in user
    doc_id: docId,
    remarks: remarks,
    receivedAt: new Date(),
  });

  newReceivingLog
    .save()
    .then((log) => res.json({ message: "Log created successfully", log }))
    .catch((err) => {
      console.error("Error logging receipt:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    });
});

// Update document status to RECEIVED and send notification email to sender
app.post("/api/docs/update-received", verifyUser, async (req, res) => {
  try {
    const { docId } = req.body;

    // Update document status
    const document = await DocModel.findByIdAndUpdate(docId, {
      status: "Received",
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Fetch sender's email using user_id from the document
    const sender = await UserModel.findById(document.user_id);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found" });
    }

    const uniqueID = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit ID

    // Set up email details for the sender
    const mailOptions = {
      from: '"DocTrack-System Mailer" <doctracks.kabankalan@gmail.com>',
      to: sender.email, // Assuming senderEmail field stores the sender's email
      subject: "Your Document Has Been Marked as Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; text-align: center;">
          <div style="padding: 20px;">
            <h2>Document Status Update</h2>
            <p>Your document titled "<strong>${document.title}</strong>" with code number <strong>${document.codeNumber}</strong> has been marked as <strong style="color: #00a308;">Received</strong> by ${document.recipient}.</p>
            <p>You may log in to view additional details.</p>
          </div>
          <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            <p style="margin: 0;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
      headers: {
        "X-Unique-ID": uniqueID.toString(), // Custom unique identifier
        "In-Reply-To": `<${new Date().getTime()}@doctracks.kabankalan.com>`, // Unique for each email
      },
    };

    // Send email notification
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending notification email" });
      } else {
        console.log("Notification email sent:", info.response);
        res.status(200).json({
          message:
            'Document status updated to "Received" successfully, and notification email sent to sender.',
        });
      }
    });
  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Log forwarding and send email notification to the recipient
app.post("/api/docs/log-forwarding", verifyUser, async (req, res) => {
  try {
    const { docId, forwardedTo, remarks } = req.body;
    const userId = req.user._id;

    // Validate the request body
    if (!docId || !forwardedTo || !remarks || !userId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Create a new forwarding log
    const newLog = await ForwardingLogModel.create({
      user_id: userId,
      doc_id: docId,
      forwardedTo,
      remarks,
      forwardedAt: new Date(),
    });

    // Update document status
    const document = await DocModel.findByIdAndUpdate(
      docId,
      { status: "Forwarded" },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found." });
    }

    // Fetch recipient's email using forwardedTo (assumed to match user's name)
    const recipient = await UserModel.findOne({ _id: forwardedTo });
    if (!recipient || !recipient.email) {
      return res
        .status(404)
        .json({ error: "Recipient not found or email not available." });
    }

    // Fetch the original sender's email using user_id in the document
    const originalSender = await UserModel.findById(document.user_id);
    if (!originalSender || !originalSender.email) {
      return res
        .status(404)
        .json({ error: "Original sender not found or email not available." });
    }

    const uniqueID = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit ID

    // Set up email details for the recipient
    const mailOptions = {
      from: '"DocTrack-System" <doctracks.kabankalan@gmail.com>',
      to: recipient.email, // Recipient's email retrieved from UserModel
      subject: "Document Forwarded to You",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; text-align: center;">
          <div style="padding: 20px;">
            <h2>Document Forwarding Notification</h2>
            <p>A document titled "<strong>${document.title}</strong>" with code number <strong>${document.codeNumber}</strong> has been forwarded to you.</p>
            <p>Remarks: <em>${remarks}</em></p>
            <p>Please review it at your earliest convenience once the document has arrived.</p>
            
          </div>
          <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            <p style="margin: 0;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
      headers: {
        "X-Unique-ID": uniqueID.toString(), // Custom unique identifier
        "In-Reply-To": `<${new Date().getTime()}@doctracks.kabankalan.com>`, // Unique for each email
      },
    };

    // Set up email details for the recipient
    const senderMailOptions = {
      from: '"DocTrack-System" <doctracks.kabankalan@gmail.com>',
      to: originalSender.email, // Sender's email retrieved from UserModel
      subject: "Your Document Is Being Forwarded",
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; text-align: center;">
              <div style="padding: 20px;">
                <h2>Document Status Update</h2>
                <p>Your document titled "<strong>${document.title}</strong>" with code number <strong>${document.codeNumber}</strong> is being <strong style="color: #00a308;">Forwarded</strong>.</p>
                <p>You may log in to track and view additional details.</p>
              </div>
              <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                <p style="margin: 0;">This is an automated message, please do not reply.</p>
              </div>
            </div>
          `,
      headers: {
        "X-Unique-ID": uniqueID.toString(), // Custom unique identifier
        "In-Reply-To": `<${new Date().getTime()}@doctracks.kabankalan.com>`, // Unique for each email
      },
    };

    // Send email notification to the recipient
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending notification email" });
      } else {
        console.log("Notification email sent:", info.response);
        res.status(201).json({
          message:
            "Forwarding log created, document status updated, and notification email sent to recipient.",
          log: newLog,
        });
      }
    });

    // Send email to the original sender
    transporter.sendMail(senderMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email to sender:", error);
      } else {
        console.log("Notification email sent to sender:", info.response);
      }
    });
  } catch (error) {
    console.error("Error logging forwarding:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to mark a document as completed
app.post("/api/docs/complete", verifyUser, async (req, res) => {
  const { docId, remarks } = req.body; // Include remarks in the request body
  const userId = req.user._id;

  try {
    const document = await DocModel.findById(docId);
    if (!document) {
      return res.status(404).json({ error: "Document not found." });
    }

    // Fetch the document's receiving and forwarding logs
    const receivingLogs = await ReceivingLogModel.find({ doc_id: docId });
    const forwardingLogs = await ForwardingLogModel.find({ doc_id: docId });

    // Create a completed log
    const completedLog = new CompletedLogModel({
      docId,
      userId,
      receivingLogs: receivingLogs.map((log) => log._id),
      forwardingLogs: forwardingLogs.map((log) => log._id),
      remarks: remarks, // Include remarks in the completed log
    });

    await completedLog.save();

    // Update the document's status to "Completed"
    await DocModel.findByIdAndUpdate(docId, { status: "Completed" });

    // Fetch the original sender's email using user_id in the document
    const originalSender = await UserModel.findById(document.user_id);
    if (!originalSender || !originalSender.email) {
      return res
        .status(404)
        .json({ error: "Original sender not found or email not available." });
    }

    const uniqueID = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit ID

    // Set up email details for the recipient
    const mailOptions = {
      from: '"DocTrack-System" <doctracks.kabankalan@gmail.com>',
      to: originalSender.email, // Recipient's email retrieved from UserModel
      subject: "Document Process Completed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; text-align: center;">
          <div style="padding: 20px;">
            <h2>Document Status Update</h2>
            <p>The document titled "<strong>${document.title}</strong>" with code number <strong>${document.codeNumber}</strong> that you submitted is now marked as <strong style="color: #00a308;">Completed</strong>.</p>
            <p>Remarks: <em>${remarks}</em></p>
            <p>Please review it at your earliest convenience.</p>
          </div>
          <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            <p style="margin: 0;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
      headers: {
        "X-Unique-ID": uniqueID.toString(), // Custom unique identifier
        "In-Reply-To": `<${new Date().getTime()}@doctracks.kabankalan.com>`, // Unique for each email
      },
    };
    // Send email using nodemailer
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Error sending email notification." });
      }
      console.log("Email sent:", info.response);
    });

    res.json({ message: "Document marked as completed", completedLog });
  } catch (error) {
    console.error("Error completing document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to track a document by controll number
app.get("/api/docs/tracking-info/:codeNumber", async (req, res) => {
  try {
    const { codeNumber } = req.params;

    const document = await DocModel.findOne({ codeNumber });
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const receivingLogs = await ReceivingLogModel.find({ doc_id: document._id })
      .sort({ receivedAt: -1 })
      .populate("user_id", "firstname lastname office")
      .populate("doc_id", "title")
      .select("user_id doc_id receivedAt remarks"); // Add remarks field

    const forwardingLogs = await ForwardingLogModel.find({
      doc_id: document._id,
    })
      .sort({ forwardedAt: -1 })
      .populate("user_id", "firstname lastname")
      .populate("doc_id", "title")
      .populate("forwardedTo", "firstname lastname")
      .select("user_id doc_id forwardedTo forwardedAt remarks"); // Add remarks field

    const completedLog = await CompletedLogModel.findOne({
      docId: document._id,
    })
      .populate("userId", "firstname lastname office")
      .populate("docId", "title")
      .select("userId docId completedAt remarks office"); // Add remarks field

    if (!completedLog || !completedLog.userId) {
      console.error("Completed log or userId not found:", completedLog);
    }

    const trackingInfo = {
      codeNumber,
      status: document.status,
      documentTitle: document.title,
      sender: document.sender,
      officeOrigin: document.originating,
      receivingLogs: receivingLogs.map((log) => ({
        receivedBy: log.user_id
          ? `${log.user_id.firstname} ${log.user_id.lastname}`
          : "Unknown User",
        office: log.user_id.office,
        receivedAt: log.receivedAt,
        documentTitle: log.doc_id.title,
        remarks: log.remarks, // Add remarks here
      })),
      forwardingLogs: forwardingLogs.map((log) => ({
        forwardedBy: log.user_id
          ? `${log.user_id.firstname} ${log.user_id.lastname}`
          : "Unknown User",
        forwardedTo: log.forwardedTo
          ? `${log.forwardedTo.firstname} ${log.forwardedTo.lastname}`
          : "Unknown User",
        forwardedAt: log.forwardedAt,
        documentTitle: log.doc_id.title,
        remarks: log.remarks, // Add remarks here
      })),
      completedLog: completedLog
        ? {
            completedBy: completedLog.userId
              ? `${completedLog.userId.firstname} ${completedLog.userId.lastname}`
              : "Unknown User",
            office: completedLog.userId.office,
            completedAt: completedLog.completedAt,
            documentTitle: completedLog.docId.title,
            remarks: completedLog.remarks, // Add remarks here
          }
        : null,
    };

    res.status(200).json(trackingInfo);
  } catch (error) {
    console.error("Error fetching tracking information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Submitting and Creating Document
app.post("/submit-document", verifyUser, (req, res) => {
  const {
    title,
    sender,
    originating,
    recipient,
    destination,
    date,
    qrCode,
    codeNumber,
    remarks,
    email,
  } = req.body;

  // Extract user_id from req.user (logged-in user's ID)
  const userId = req.user._id;
  // Convert the date string to a Date object
  const formattedDate = new Date(date);

  // Create a new document using the DocModel
  DocModel.create({
    title,
    sender,
    originating,
    recipient,
    destination,
    date: formattedDate,
    qrCode,
    codeNumber,
    remarks,
    user_id: userId, // Attach the logged-in user's ID
  })
    .then((document) => {
      // Send the email notification
      const uniqueID = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit ID

      const mailOptions = {
        from: '"DocTrack-System Mailer" <doctracks.kabankalan@gmail.com>',
        to: email,
        subject: `New Document Notification`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
              <div style="padding: 20px;">
                <p style="font-size: 16px; color: #333;">
                  Hello,
                </p>
                <p style="font-size: 16px; color: #333;">
                  A new document titled <strong>"${title}"</strong> has been sent to you.
                </p>
                <div style="margin: 15px 0; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
                  <p style="font-size: 16px; color: #333;"><strong>From:</strong> ${sender}</p>
                  <p style="font-size: 16px; color: #333;"><strong>Office:</strong> ${originating}</p>
                </div>
                <p style="font-size: 16px; color: #333;">
                  Please review it at your earliest convenience once the document has arrived.
                </p>
                <p style="font-size: 16px; text-align: center; margin-top: 30px;">
                  <a href="https://doc-track-system.vercel.app/inbox" style="padding: 10px 20px; background-color: #129bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">View Document</a>
                </p>
              </div>
              <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                <p style="margin: 0;">This is an automated message, please do not reply.</p>
              </div>
            </div>
        `,
        headers: {
          "X-Unique-ID": uniqueID.toString(), // Custom unique identifier
          "In-Reply-To": `<${new Date().getTime()}@doctracks.kabankalan.com>`, // Unique for each email
        },
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Email sending error: ", error);
          return res
            .status(500)
            .json({ message: "Error sending notification email" });
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      // Return response to the client
      res.json({ message: "Success", document });
    })
    .catch((err) => {
      console.log("Submitting Document Error: ", err);
      res
        .status(500)
        .json({ message: "Error submitting document", error: err });
    });
});

// Route to archive a document
app.post("/archive-document", (req, res) => {
  const { docId } = req.body;

  DocModel.findByIdAndUpdate(docId, { status: "Archived" }, { new: true })
    .then((updatedDoc) => {
      if (!updatedDoc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({
        message: "Document archived successfully",
        document: updatedDoc,
      });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Route to restore a document
app.post("/restore-document", (req, res) => {
  const { docId } = req.body;

  DocModel.findByIdAndUpdate(docId, { status: "Restored" }, { new: true })
    .then((updatedDoc) => {
      if (!updatedDoc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({
        message: "Document restored successfully",
        document: updatedDoc,
      });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Route to fetch archived documents sent by the logged-in user
app.get("/archived-document", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;

  try {
    const archivedDocuments = await DocModel.find({
      user_id: loggedInUserId,
      status: "Archived",
    })
      .populate("_id", "date title codeNumber sender originating")
      .exec();

    if (archivedDocuments.length === 0) {
      return res.status(404).json("No archived documents found");
    }

    const documents = archivedDocuments.map((doc) => ({
      _id: doc._id,
      date: doc.date,
      title: doc.title,
      sender: doc.sender,
      originating: doc.originating,
      recipient: doc.recipient,
      destination: doc.destination,
      codeNumber: doc.codeNumber,
      remarks: doc.remarks,
      status: doc.status,
    }));

    res.json(documents);
  } catch (err) {
    console.error("Error fetching archived documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout route to clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Find the document using docId
app.get("/api/docs/view-complete/:docId", async (req, res) => {
  try {
    const { docId } = req.params;

    // Find the document using docId
    const document = await DocModel.findById(docId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const receivingLogs = await ReceivingLogModel.find({ doc_id: document._id })
      .sort({ receivedAt: -1 })
      .populate("user_id", "firstname lastname")
      .populate("doc_id", "title")
      .select("user_id doc_id receivedAt remarks");

    const forwardingLogs = await ForwardingLogModel.find({
      doc_id: document._id,
    })
      .sort({ forwardedAt: -1 })
      .populate("user_id", "firstname lastname")
      .populate("doc_id", "title")
      .populate("forwardedTo", "firstname lastname")
      .select("user_id doc_id forwardedTo forwardedAt remarks");

    const completedLog = await CompletedLogModel.findOne({
      docId: document._id,
    })
      .populate("userId", "firstname lastname")
      .populate("docId", "title")
      .select("userId docId completedAt remarks");

    if (!completedLog || !completedLog.userId) {
      console.error("Completed log or userId not found:", completedLog);
    }

    const formatDateTime = (dateTime) => {
      return new Date(dateTime).toLocaleString(); // This will format to "MM/DD/YYYY, HH:MM:SS AM/PM"
    };

    const trackingInfo = {
      codeNumber: document.codeNumber,
      status: document.status,
      documentTitle: document.title,
      receivingLogs: receivingLogs.map((log) => ({
        receivedBy: log.user_id
          ? `${log.user_id.firstname} ${log.user_id.lastname}`
          : "Unknown User",
        receivedAt: formatDateTime(log.receivedAt), // Formatting date and time
        documentTitle: log.doc_id.title,
        remarks: log.remarks,
      })),
      forwardingLogs: forwardingLogs.map((log) => ({
        forwardedBy: log.user_id
          ? `${log.user_id.firstname} ${log.user_id.lastname}`
          : "Unknown User",
        forwardedTo: log.forwardedTo
          ? `${log.forwardedTo.firstname} ${log.forwardedTo.lastname}`
          : "Unknown User",
        forwardedAt: formatDateTime(log.forwardedAt), // Formatting date and time
        documentTitle: log.doc_id.title,
        remarks: log.remarks,
      })),
      completedLog: completedLog
        ? {
            completedBy: completedLog.userId
              ? `${completedLog.userId.firstname} ${completedLog.userId.lastname}`
              : "Unknown User",
            completedAt: formatDateTime(completedLog.completedAt), // Formatting date and time
            documentTitle: completedLog.docId.title,
            remarks: completedLog.remarks,
          }
        : null,
    };

    res.status(200).json(trackingInfo);
  } catch (error) {
    console.error("Error fetching tracking information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => {
  console.log("Server is Running");
});
