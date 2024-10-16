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

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);
app.use(cookieParser());

mongoose.connect("mongodb://127.0.0.1:27017/doc_track");

// JWT secret key (you should store this in an environment variable)
const JWT_SECRET = "jwt-secret-key";

// Middleware to verify token
const verifyUser = (req, res, next) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

  console.log("Token from request headers:", req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("Decoded token:", decoded); // Log decoded token

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

//Login Page
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  UserModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return res
              .status(500)
              .json({ Status: "Error", message: "Internal server error" });
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
              secure: true,
              sameSite: "Strict",
              path: "/",
              domain: "localhost",
            });
            res.cookie("refreshToken", refreshToken, {
              secure: true, // Use true if your server uses HTTPS
              sameSite: "Strict", // Ensure correct cross-site handling
              domain: "localhost",
            });

            // Respond with the tokens
            return res.json({
              accessToken,
              refreshToken,
              role: user.role,
              Status: "Success",
            });
          } else {
            return res.status(401).json({ message: "Incorrect password" });
          }
        });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Internal server error" });
    });
});

//Route to Refresh Token
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
    res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: true });
    return res.json({ accessToken: newAccessToken });
  });
});

app.get("/api/user/details", verifyUser, (req, res) => {
  const { firstname, lastname, role, email, position, office } = req.user;
  console.log({ firstname, lastname, role, email, position, office }); // Log to check the values
  res.json({ firstname, lastname, role, email, position, office });
});

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

app.get("/api/docs/sent", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;
  console.log("Fetching documents sent by user ID:", loggedInUserId);

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
    console.log("Current User", user);

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

app.get("/api/docs/inbox", verifyUser, async (req, res) => {
  const loggedInUserFullName = `${req.user.firstname} ${req.user.lastname}`;
  console.log("Fetching documents for user ID:", loggedInUserFullName);

  try {
    const documents = await DocModel.find({
      recipient: loggedInUserFullName, // Documents where the logged-in user is the recipient
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

app.get("/api/docs/received", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;
  console.log("Fetching documents for user ID:", loggedInUserId);

  try {
    const forwardingLogs = await ForwardingLogModel.find({
      forwardedTo: loggedInUserId,
    })
      .populate("doc_id", "date forwardedAt title codeNumber") // Populate the document fields
      .populate({
        path: "user_id", // Populate the sender's name
        select: "firstname lastname",
      })
      .exec();

    if (forwardingLogs.length === 0) {
      return res.status(404).json({ message: "No forwarded documents found" });
    }

    const documents = forwardingLogs.map((log) => ({
      date: log.forwardedAt,
      title: log.doc_id.title,
      sender: `${log.user_id.firstname} ${log.user_id.lastname}`, // Sender's full name
      remarks: log.remarks,
      codeNumber: log.doc_id.codeNumber,
    }));
    res.json(documents);
  } catch (err) {
    console.error("Error fetching forwarded documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/docs/forwarded", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;

  try {
    const forwardingLogs = await ForwardingLogModel.find({
      user_id: loggedInUserId,
    })
      .populate("doc_id", "date forwardedAt title codeNumber") // Populate the document details
      .populate("forwardedTo", "firstname lastname") // Populate the first and last name of the recipient
      .exec();

    if (forwardingLogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No documents forwarded by the user" });
    }

    // Constructing the response
    const documents = forwardingLogs.map((log) => ({
      date: log.forwardedAt,
      title: log.doc_id.title,
      forwardedTo: `${log.forwardedTo.firstname} ${log.forwardedTo.lastname}`, // Combine the first and last name
      remarks: log.remarks,
      codeNumber: log.doc_id.codeNumber,
    }));

    res.json(documents);
  } catch (err) {
    console.error("Error fetching forwarded documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/docs/completed", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;

  try {
    // Fetch completed logs where the user is either the one who completed the document or the sender
    const completedLogs = await CompletedLogModel.find({
      userId: loggedInUserId, // User who marked the document as completed
    })
      .populate("docId", "date title completedAt sender recipient") // Populate document details
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

app.get("/getUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findById({ _id: id })
    .then((user) => res.json(user))
    .catch((err) => res.json(err));
});

// app.get("/api/docs/received", verifyUser, (req, res) => {
//   const loggedInUserId = req.user._id; // Ensure _id is used

//   ForwardingLogModel.find({ forwardedTo: loggedInUserId })
//     .populate("doc_id") // Populate the related document details
//     .then((forwardingLogs) => {
//       if (forwardingLogs.length === 0) {
//         return res
//           .status(404)
//           .json({ message: "No forwarded documents found" });
//       }
//       const doc = forwardingLogs.map((log) => log.doc_id);
//       res.json(doc); // Return the documents
//     })
//     .catch((err) => {
//       console.error("Error fetching forwarded documents:", err);
//       res.status(500).json({ error: "Internal server error" });
//     });
// });

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
      res.json(user);
    })
    .catch((err) => res.status(500).json({ error: "Internal server error" }));
});

// Updated: Add user and generate token
app.post("/add-user", (req, res) => {
  const { firstname, lastname, email, password, position, office } = req.body;

  // Hash the password
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      // Create a new user in the database
      UserModel.create({
        firstname,
        lastname,
        email,
        password: hash,
        position,
        office,
      })
        .then((user) => {
          // Generate a token after creating the user
          // const token = jwt.sign({ email: user.email }, JWT_SECRET, {
          //   expiresIn: "1h",
          // });

          // Set token in cookies
          // res.cookie("token", token, { httpOnly: true });
          res.json({ message: "User added successfully" });
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

app.post("/api/docs/update-received", verifyUser, async (req, res) => {
  try {
    const { docId } = req.body;
    await DocModel.findByIdAndUpdate(docId, { status: "Received" });

    res
      .status(200)
      .json({ message: 'Document status updated to "Received" successfully.' });
  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/docs/log-forwarding", verifyUser, async (req, res) => {
  try {
    console.log(req.body); // To check if you're receiving docId, forwardedTo, and remarks
    const { docId, forwardedTo, remarks } = req.body;
    const userId = req.user._id; // Corrected to _id

    // Validate the request body
    if (!docId || !forwardedTo || !remarks || !userId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Create a new forwarding log
    const newLog = await ForwardingLogModel.create({
      user_id: userId,
      doc_id: docId,
      forwardedTo: forwardedTo,
      remarks: remarks,
      forwardedAt: new Date(),
    });

    // Update document status
    await DocModel.findByIdAndUpdate(docId, { status: "Forwarded" });

    res.status(201).json({
      message:
        "Forwarding log created and document status updated successfully.",
      log: newLog,
    });
  } catch (error) {
    console.error("Error logging forwarding:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/docs/complete", verifyUser, async (req, res) => {
  const { docId, remarks } = req.body; // Include remarks in the request body
  const userId = req.user._id;

  try {
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

    res.json({ message: "Document marked as completed", completedLog });
  } catch (error) {
    console.error("Error completing document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/docs/tracking-info/:codeNumber", async (req, res) => {
  try {
    const { codeNumber } = req.params;

    const document = await DocModel.findOne({ codeNumber });
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const receivingLogs = await ReceivingLogModel.find({ doc_id: document._id })
      .sort({ receivedAt: -1 })
      .populate("user_id", "firstname lastname")
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
      .populate("userId", "firstname lastname")
      .populate("docId", "title")
      .select("userId docId completedAt remarks"); // Add remarks field

    if (!completedLog || !completedLog.userId) {
      console.error("Completed log or userId not found:", completedLog);
    }

    const trackingInfo = {
      codeNumber,
      status: document.status,
      documentTitle: document.title,
      receivingLogs: receivingLogs.map((log) => ({
        receivedBy: log.user_id
          ? `${log.user_id.firstname} ${log.user_id.lastname}`
          : "Unknown User",
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
    .then((document) => res.json({ message: "Success", document }))
    .catch((err) => res.json("Submitting Document Error: ", err));
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

// Route to fetch archived documents
app.get("/archived-document", (req, res) => {
  DocModel.find({ status: "Archived" })
    .then((documents) => {
      res.json(documents);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
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
