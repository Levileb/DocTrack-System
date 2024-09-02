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
  const token = req.cookies.token;

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

// New: User login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  UserModel.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Compare the provided password with the stored hash
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign({ email: user.email }, JWT_SECRET, {
          expiresIn: "1h", // Token expires in 1 hour
        });

        // Set token in cookies
        res.cookie("token", token, { httpOnly: true });
        res.json({ message: "Login successful", token });
      });
    })
    .catch((err) => {
      console.error("Error during login:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

app.get("/api/user/details", verifyUser, (req, res) => {
  const { firstname, lastname, role, email, office } = req.user;
  console.log({ firstname, lastname, role, email, office }); // Log to check the values
  res.json({ firstname, lastname, role, email, office });
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

app.get("/api/docs/received", verifyUser, async (req, res) => {
  const loggedInUserId = req.user._id;
  console.log("Fetching documents for user ID:", loggedInUserId);

  try {
    const forwardingLogs = await ForwardingLogModel.find({
      forwardedTo: loggedInUserId,
    })
      .populate("doc_id", "date title") // Populate the document fields
      .populate({
        path: "user_id", // Populate the sender's name
        select: "firstname lastname",
      })
      .exec();

    if (forwardingLogs.length === 0) {
      return res.status(404).json({ message: "No forwarded documents found" });
    }

    const documents = forwardingLogs.map((log) => ({
      date: log.doc_id.date,
      title: log.doc_id.title,
      sender: `${log.user_id.firstname} ${log.user_id.lastname}`, // Sender's full name
      remarks: log.remarks,
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
      .populate("doc_id", "date title") // Populate the document details
      .populate("forwardedTo", "firstname lastname") // Populate the first and last name of the recipient
      .exec();

    if (forwardingLogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No documents forwarded by the user" });
    }

    // Constructing the response
    const documents = forwardingLogs.map((log) => ({
      date: log.doc_id.date,
      title: log.doc_id.title,
      forwardedTo: `${log.forwardedTo.firstname} ${log.forwardedTo.lastname}`, // Combine the first and last name
      remarks: log.remarks,
    }));

    res.json(documents);
  } catch (err) {
    console.error("Error fetching forwarded documents:", err);
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

app.get("/api/docs/received", verifyUser, (req, res) => {
  const loggedInUserId = req.user._id; // Ensure _id is used

  ForwardingLogModel.find({ forwardedTo: loggedInUserId })
    .populate("doc_id") // Populate the related document details
    .then((forwardingLogs) => {
      if (forwardingLogs.length === 0) {
        return res
          .status(404)
          .json({ message: "No forwarded documents found" });
      }
      const doc = forwardingLogs.map((log) => log.doc_id);
      res.json(doc); // Return the documents
    })
    .catch((err) => {
      console.error("Error fetching forwarded documents:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

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
          const token = jwt.sign({ email: user.email }, JWT_SECRET, {
            expiresIn: "1h",
          });

          // Set token in cookies
          res.cookie("token", token, { httpOnly: true });
          res.json({ message: "User added successfully", token });
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

app.post("/submit-document", (req, res) => {
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
  })
    .then((document) => res.json("Success"))
    .catch((err) => res.json(err));
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

app.post("/", (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  UserModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        // Compare provided password with hashed password in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return res
              .status(500)
              .json({ Status: "Error", message: "Internal server error" });
          }

          if (isMatch) {
            // Generate JWT token if password matches
            const token = jwt.sign(
              { email: user.email, role: user.role },
              "jwt-secret-key", // Replace this with a more secure secret key
              { expiresIn: "1d" }
            );

            // Send the token as a cookie
            res.cookie("token", token, { httpOnly: true, secure: true });

            // Send success response with user role
            return res.json({
              Status: "Success",
              token: token,
              role: user.role,
            });
          } else {
            // Incorrect password
            return res
              .status(401)
              .json({ Status: "Error", message: "Incorrect password" });
          }
        });
      } else {
        // User not found
        return res
          .status(404)
          .json({ Status: "Error", message: "No user found with this email" });
      }
    })
    .catch((error) => {
      // Handle database or other errors
      return res
        .status(500)
        .json({ Status: "Error", message: "Internal server error" });
    });
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
