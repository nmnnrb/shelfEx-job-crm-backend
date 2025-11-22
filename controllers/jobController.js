const Job = require("../models/Jobs");

exports.createJob = async (req, res) => {
    const {company, role, appliedDate, notes, status} = req.body;
    try {
        const job = await Job.create({
            userId: req.user._id,
            company,
            role,
            appliedDate,
            notes,
            status
        });
        try {
            req.io.to("admins").emit("jobCreated", job);
        } catch (error) {
            console.error("Error emitting jobCreated event to admins:", error);
        }
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.user._id }).sort({ appliedDate: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateMyJob = async (req, res) => {
    try {
        
        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );

        if (!job) return res.status(404).json({ message: "Job not found" });


         try {
            req.io.to("admins").emit("jobUpdated", job);
        } catch (e) {
            console.error("Failed to emit jobUpdated to admins:", e.message);
        }



        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteJob = async (req, res) => {
    console.log("deleteJob called for job id:", req.params.id);
    try {
        await Job.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        console.log("deleteJob result:", resp);
        try {
            req.io.to("admins").emit("jobDeleted", { id: req.params.id });
        } catch (e) {
            console.error("Failed to emit jobDeleted to admins:", e.message);
        }
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//admin ------------>>>>>>>-----------------
 exports.adminGetAllJobs = async (req, res) => {

        console.log("adminGetAllJobs called");
        try {
            const jobs = await Job.find()
                .populate("userId", "name email role")
                .sort({ appliedDate: -1 });

            res.json(jobs);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };



     exports.adminUpdateJob = async (req, res) => {
        try {
       
            const updates = { ...req.body };
            // prevent changing ownership
            if (updates.userId) delete updates.userId;

            const job = await Job.findByIdAndUpdate(req.params.id, updates, { new: true });
            if (!job) return res.status(404).json({ message: "Job not found" });

            // if status changed, notify the job owner
            if (updates.status) {
                const socketId2 = req.onlineUsers && req.onlineUsers.get && req.onlineUsers.get(job.userId.toString());
                if (socketId2) {
                    req.io.to(socketId2).emit("statusUpdated", job);
                } else {
                    console.log("User not online, cannot send statusUpdated socket:", job.userId.toString());
                }
            }

            res.json(job);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };


    exports.adminUpdateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!job) return res.status(404).json({ message: "Job not found" });

        // ⚡ socket notification
        // send to the user's socket id if they're online (stored in req.onlineUsers)
        const socketId = req.onlineUsers && req.onlineUsers.get && req.onlineUsers.get(job.userId.toString());
        if (socketId) {
            req.io.to(socketId).emit("statusUpdated", job);
        } else {
            console.log("User not online, cannot send statusUpdated socket:", job.userId.toString());
        }

        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


     exports.adminDeleteJob = async (req, res) => {
        try {
            const job = await Job.findByIdAndDelete(req.params.id);
            if (!job) return res.status(404).json({ message: "Job not found" });

            // notify job owner (if online)
            const socketId3 = req.onlineUsers && req.onlineUsers.get && req.onlineUsers.get(job.userId.toString());
            if (socketId3) {
                req.io.to(socketId3).emit("jobDeleted", { id: job._id });
            } else {
                console.log("User not online, cannot send jobDeleted socket:", job.userId.toString());
            }

            res.json({ message: "Deleted" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };