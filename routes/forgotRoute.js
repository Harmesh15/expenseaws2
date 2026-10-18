const express = require("express");
const route = express.Router();
const forgotController = require("../controller/forgotController");

console.log("hit route");

route.post("/sendmail", forgotController.sendmailTouser);
route.post("/savepassword", forgotController.saveNewpassword);

module.exports = route;
