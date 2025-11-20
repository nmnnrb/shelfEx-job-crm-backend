const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


exports.signup = async (req, res) => {
    try {
        console.log("signup try");
        const { name, email, password, role } = req.body;

        const exists = await User.findOne({ email });
        console.log("signup found existing user:", exists);
     
        const user = await User.create({ name, email, password, role });

          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
          
            res.cookie("token", token, {
            httpOnly: true,
            secure: false,           
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: "Signup successful" , 
            user: { id: user._id, name: user.name, role: user.role }
         });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("login start")
        const user = await User.findOne({ email });
        console.log("login found user:", user);

        if (!user) return res.status(400).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        console.log("password match:", match); //remove
        if (!match) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Send token cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: 1 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Login successful",
            user: { id: user._id, name: user.name, role: user.role }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
