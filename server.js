require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { auth } = require('./middleware/auth');
const http = require('http');
const { Server } = require('socket.io');

console.log("CORS origin:", process.env.client_url);

app.set("trust proxy", 1);
app.use(cors({ origin: process.env.client_url, credentials: true ,
        methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
    
 }));



const server = http.createServer(app);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));







// mongoDB connection
connectDB();


//--------socket.io 

const io = new Server(server, {
    cors: {
        origin: process.env.client_url,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

const connectionMap = new Map();

io.on("connection", (socket) => {
  console.log("New client connected, socket id:", socket.id);
    socket.on("registerUser", async (userId) => {
        try {
            connectionMap.set(userId, socket.id);
        socket.join(userId);

        const User = require("./models/User");
        const user = await User.findById(userId).select("role");
        if (user && user.role === "admin") {
            socket.join("admins");
        }
        } catch (error) {
            console.error("Error in registerUser:", error);
        }
    });

    socket.on("disconnect", () => {
          [...connectionMap.entries()].forEach(([userId, socketId]) => {
            if (socketId === socket.id) {
                connectionMap.delete(userId);
            }
        });
    });
});



// make io and online users map available to all express routes
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = connectionMap;
    next();
});

//----------------------------------------------

app.get('/', (req, res) => {
    res.send('Hello, Worsdsdld!');
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

server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});