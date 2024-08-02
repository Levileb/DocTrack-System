const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const UserModel = require('./models/User');
const DocModel = require('./models/Document');
const OfficeModel = require('./models/Office');
const ReceivingLogModel = require('./models/ReceivingLogs');
const ForwardingLogModel = require('./models/ForwardingLogs');


const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods:["GET", "POST", "PUT"],
    credentials: true
}));
app.use(cookieParser());

mongoose.connect('mongodb://127.0.0.1:27017/doc_track');

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Token is missing" });
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Error with token" });
            } else {
                UserModel.findOne({ email: decoded.email }) // Assuming email is unique
                    .then(user => {
                        if (!user) {
                            return res.status(401).json({ error: "User not found" });
                        }
                        req.user = {
                            id: user._id, // Add user ID to request object
                            firstname: user.firstname,
                            lastname: user.lastname,
                            role: user.role,
                            office: user.office
                        }; 
                        next();
                    })
                    .catch(err => {
                        console.error("Error finding user:", err);
                        return res.status(500).json({ error: "Internal server error" });
                    });
            }
        });
    }
};



// Update the '/api/user/details' endpoint to send user details along with the response
app.get('/api/user/details', verifyUser, (req, res) => {
    // Extract user details from the request object (you can modify this based on your user schema)
    const { firstname, lastname, role, email, office } = req.user;

    // Send the user details in the response
    res.json({ firstname, lastname, role, email, office });
});


app.get('/api/user/details/:userId', verifyUser, (req, res) => {
    const userId = req.params.userId;

    // Find the user by ID in the database
    UserModel.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            // Send the user details in the response
            res.json(user);
        })
        .catch(err => {
            console.error("Error fetching user details:", err);
            res.status(500).json({ error: "Internal server error" });
        });
});

// Endpoint to fetch all users
app.get('/view-user', (req, res) => {
    UserModel.find()
        .then(user => {
            res.json(user);
        })
        .catch(err => {
            console.error("Error fetching users:", err);
            res.status(500).json({ error: "Internal server error" });
        });
});

// New route to archive a user
app.post('/archive-user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        await UserModel.findByIdAndUpdate(userId, { isArchived: true });
        res.status(200).json({ message: "User archived successfully." });
    } catch (error) {
        console.error("Error archiving user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to fetch all documents
app.get('/api/docs', (req, res) => {
    DocModel.find()
        .then(docs => {
            res.json(docs);
        })
        .catch(err => {
            console.error("Error fetching documents:", err);
            res.status(500).json({ error: "Internal server error" });
        });
});

// Endpoint to fetch a single document by its ID
app.get('/api/docs/:docId', verifyUser, (req, res) => {
    const docId = req.params.docId;

    // Find the document by ID in the database
    DocModel.findById(docId)
        .then(doc => {
            if (!doc) {
                return res.status(404).json({ error: "Document not found" });
            }
            // Send the document details in the response
            res.json(doc);
        })
        .catch(err => {
            console.error("Error fetching document:", err);
            res.status(500).json({ error: "Internal server error" });
        });
});

// Endpoint to update a document
app.put('/api/docs/:docId', verifyUser, (req, res) => {
    const docId = req.params.docId;

    // Update the document in the database
    DocModel.findByIdAndUpdate(docId, req.body, { new: true })
        .then(doc => {
            if (!doc) {
                return res.status(404).json({ error: "Document not found" });
            }
            res.json(doc);
        })
        .catch(err => res.status(500).json({ error: "Internal server error" }));
});

app.get('/getUser/:id', (req, res) => {
    const id = req.params.id;
    UserModel.findById({_id:id})
    .then(user => res.json(user))
    .catch(err =>res.json(err))
})

app.put('/updateUser/:id', (req, res) => {
    const id = req.params.id;

    // Convert id string to MongoDB ObjectId
    const ObjectId = mongoose.Types.ObjectId;

    UserModel.findByIdAndUpdate(
        { _id: new ObjectId(id) }, // Convert id string to ObjectId
        { $set: req.body }, // Update all fields from the request body
        { new: true } // Return the updated document
    )
    .then(user => {
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    })
    .catch(err => res.status(500).json({ error: "Internal server error" }));
});

// Endpoint to add a new user
app.post('/add-user', (req, res) => {
    const { firstname, lastname, email, password, position, office } = req.body;

    // Hash the password
    bcrypt.hash(password, 10)
        .then(hash => {
            // Create a new user in the database
            UserModel.create({ firstname, lastname, email, password: hash, position, office })
                .then(user => res.json({ message: "User added successfully" }))
                .catch(err => res.status(500).json({ error: "Internal server error" }));
        })
        .catch(err => {
            console.error("Error hashing password:", err);
            res.status(500).json({ error: "Internal server error" });
        });
});

app.post('/add-office', (req, res) => {
    const { office } = req.body;

    // Create a new document using the DocModel
    OfficeModel.create({ office })
        .then(office => res.json("Success"))
        .catch(err => res.json(err));
});

// Endpoint to fetch all offices
app.get('/offices', (req, res) => {
    OfficeModel.find()
        .then(offices => {
            res.json(offices);
        })
        .catch(err => {
            console.error("Error fetching offices:", err);
            res.status(500).json({ error: "Internal server error" });
        });
});
app.post('/api/docs/update-status', async (req, res) => {
    try {
        const { docId, status } = req.body; // Accept the status as a parameter
        await DocModel.findByIdAndUpdate(docId, { status: status });
        res.status(200).json({ message: 'Document status updated successfully.' });
    } catch (error) {
        console.error('Error updating document status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  // Update the backend endpoint to match the frontend request
app.get('/api/receivingLogs', verifyUser, async (req, res) => {
    try {
        // Fetch receiving logs data from the database
        const logs = await ReceivingLogModel.find({ user_id: req.user.id })
            .populate('doc_id'); // Populate the document details

        // Send the receiving logs data in the response
        res.status(200).json(logs);
    } catch (error) {
        console.error('Error fetching receiving logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


  app.post('/api/docs/log-receipt', verifyUser, async (req, res) => {
    try {
        const { docId } = req.body;
        const userId = req.user.id;

        const newLog = await ReceivingLogModel.create({
            user_id: userId,
            doc_id: docId,
            receivedAt: new Date()
        });

        res.status(201).json({ message: 'Receipt logged successfully.', log: newLog });
    } catch (error) {
        console.error('Error logging receipt:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/docs/update-received', verifyUser, async (req, res) => {
    try {
        const { docId } = req.body;
        const userId = req.user.id;

        await DocModel.findByIdAndUpdate(docId, { status: 'Received' });

        const newLog = await ReceivingLogModel.create({
            user_id: userId,
            doc_id: docId,
            receivedAt: new Date()
        });

        res.status(200).json({ message: 'Document status updated to "Received" and receipt logged successfully.', log: newLog });
    } catch (error) {
        console.error('Error updating document status to "Received" and logging receipt:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add this to your backend routes
app.post('/api/docs/log-forwarding', verifyUser, async (req, res) => {
    try {
        const { docId, forwardedTo } = req.body;
        const userId = req.user.id;
        const newLog = await ForwardingLogModel.create({
            user_id: userId,
            doc_id: docId,
            forwardedTo: forwardedTo,
            forwardedAt: new Date()
        });
        // Update the document's status to "Forwarded"
        await DocModel.findByIdAndUpdate(docId, { status: 'Forwarded' });
        res.status(201).json({ message: 'Forwarding log created and document status updated successfully.', log: newLog });
    } catch (error) {
        console.error('Error logging forwarding:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get('/api/docs/tracking-info/:codeNumber', async (req, res) => {
    try {
        const { codeNumber } = req.params;

        const document = await DocModel.findOne({ codeNumber }).populate('destination');
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }

        const receivingLogs = await ReceivingLogModel.find({ doc_id: document._id })
            .sort({ receivedAt: -1 })
            .populate('user_id');

        const forwardingLogs = await ForwardingLogModel.find({ doc_id: document._id })
            .sort({ forwardedAt: -1 })
            .populate('user_id');

        const trackingInfo = {
            codeNumber,
            status: document.status,
            location: document.destination,
            documentTitle: document.title,
            receivingLogs: receivingLogs.map(log => ({
                receivedBy: `${log.user_id.firstname} ${log.user_id.lastname}`,
                receivedAt: log.receivedAt
            })),
            forwardingLogs: forwardingLogs.map(log => ({
                forwardedBy: `${log.user_id.firstname} ${log.user_id.lastname}`,
                forwardedTo: log.forwardedTo,
                forwardedAt: log.forwardedAt
            }))
        };

        res.status(200).json(trackingInfo);
    } catch (error) {
        console.error('Error fetching tracking information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  

app.post('/submit-document', (req, res) => {
    const { title, sender, originating, recipient, destination, date, qrCode, codeNumber } = req.body;

    // Convert the date string to a Date object
    const formattedDate = new Date(date);

    // Create a new document using the DocModel
    DocModel.create({ title, sender, originating, recipient, destination, date: formattedDate, qrCode, codeNumber })
        .then(document => res.json("Success"))
        .catch(err => res.json(err));
});



app.post('/', (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email: email })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, (err, response) => {
                    if (response) {
                        const token = jwt.sign({ email: user.email, role: user.role }, 
                            "jwt-secret-key", { expiresIn: '1d' });
                        res.cookie('token', token);
                        return res.json({ Status: "Success", role: user.role });
                    } else {
                        return res.json("The password is incorrect");
                    }
                });
            } else {
                return res.json("No record existed");
            }
        });
});

app.listen(3001, () => {
    console.log("Server is Running");
});
