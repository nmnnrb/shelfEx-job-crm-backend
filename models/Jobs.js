const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true
     },

    company: { 
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    appliedDate: {
        type: Date,
        required: true,
        default: Date.now  
    },

    notes: { 
        type: String 
    },

    status: {
        type: String,
        enum: ["Applied", "Interview", "Offer Sent", "Rejected", "Accepted"],
        default: "Applied"
    }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
