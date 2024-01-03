const express = require("express");
const { protect } = require("../middleware/authMidddleware");
const { sendMessage, allMessage } = require("../controller/messageController");

const router = express.Router();

router.route("/:chatId").get(protect, allMessage);
router.route("/").post(protect, sendMessage);

module.exports = router;
