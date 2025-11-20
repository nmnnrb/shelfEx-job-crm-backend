const express = require("express");
const router = express.Router();
const { createJob, getMyJobs, updateMyJob, deleteJob } = require('../controllers/jobController');
const { auth } = require("../middleware/auth");




router.post("/", auth, createJob);
router.get("/", auth,getMyJobs); 
router.put("/:id", updateMyJob); 
router.delete("/:id", deleteJob);


module.exports = router;