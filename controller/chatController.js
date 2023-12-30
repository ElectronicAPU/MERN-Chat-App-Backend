const asyncHandler = require("express-async-handler");
const Chat = require("../modles/chatModel");
const User = require("../modles/userModel");
const Message = require("../modles/messageModel"); // Import the Message model

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userId param not sent with request");
    return res.sendStatus(404);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
    // ⬆️ req.user._id is the USER who actually logged in and userId is the one which logged in user want to chat with ****⬆️
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name , pic, email",
  });

  if (isChat.length > 0) {
    res.status(200).send(isChat[0]); // Assuming isChat[0] is the intended result
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    const results = await Chat.find({ users: { $all: [req.user._id] } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name , pic, email",
    });

    res.status(200).send(populatedResults);
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = { accessChat, fetchChats };
