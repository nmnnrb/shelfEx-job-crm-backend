require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { auth } = require('./middleware/auth');

app.use(cookieParser());
app.use(express.json());


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: process.env.client_url, credentials: true }));

// mongoDB connection
connectDB();


app.get('/', (req, res) => {
    res.send('Hello, World!');
    }
);

app.use("/api/auth", authRoutes);
app.use("/api/job", jobRoutes);

app.get('/api/auth/check', auth, (req, res) => {
    console.log("check auth route called");

    return res.json({
        authenticated: true,
        user: req.user
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});