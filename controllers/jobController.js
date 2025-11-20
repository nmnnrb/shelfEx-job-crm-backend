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
        delete req.body.status; // Prevent status change by user

        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );

        if (!job) return res.status(404).json({ message: "Job not found" });

        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        await Job.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
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