const asyncHandler = require("express-async-handler");
const Chat = require("../modles/chatModel");
const User = require("../modles/userModel");

const accessChat = asyncHandler(async (req, res) => {
  //This is the ID which i am going to chats with
  const { userId } = req.body;

  //IF not userId found
  if (!userId) {
    console.log("userId param not sent with request");
    return res.sendStatus(404);
  }

  // if userId found then create a new chat
  var isChat = await Chat.find({
    isGroupChat: false,
    //$all is used to match documents where the users array contains all the specified elements (req.user._id and userId).
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");
  //⬆️ and here i populate the users from the chatModel without the password⬆️ and also added(populate) the latest message

  //⬇️ here i gona populate the sender came from MESSAGE MODEL with name pic and email⬇️
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name , pic, email",
  });
  // if chat is exist
  if (isChat.length > 0) {
    res.sendStatus(isChat[0]);
  } else {
    // if there are not any chat then i create a chat
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
      // ⬆️ here is we check the *req.user._id* who send the chat 1st and the reciver is userId⬆️
    };

    try {
      // create the CHAT
      const createdChat = await Chat.create(chatData);
      // This was the just created chat and find and sned it with out the passed
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

module.exports = { accessChat };
