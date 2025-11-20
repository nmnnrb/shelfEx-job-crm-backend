require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.use(express.json());



// mongoDB connection
connectDB();


app.get('/', (req, res) => {
    res.send('Hello, World!');
    }
);

app.use("/api/auth", authRoutes);
app.use("/api/job", jobRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});