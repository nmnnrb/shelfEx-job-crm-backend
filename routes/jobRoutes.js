const express = require("express");
const router = express.Router();
const { createJob, getMyJobs, updateMyJob, deleteJob, adminGetAllJobs, adminUpdateJob, adminDeleteJob, adminUpdateStatus } = require('../controllers/jobController');
const { auth, adminOnly } = require("../middleware/auth");



//simple user
router.post("/", auth, createJob);
router.get("/", auth,getMyJobs); 
router.put("/:id", auth, updateMyJob); 
router.delete("/:id", auth,  deleteJob);


//admin user
router.put("/admin/status/:id", auth, adminOnly, adminUpdateStatus);
router.get("/admin/all", auth, adminOnly, adminGetAllJobs);   //admin
router.put("/admin/:id", auth, adminOnly, adminUpdateJob);    //admin
router.delete("/admin/:id", auth, adminOnly, adminDeleteJob); //admin


module.exports = router;