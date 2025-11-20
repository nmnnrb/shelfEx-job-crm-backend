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