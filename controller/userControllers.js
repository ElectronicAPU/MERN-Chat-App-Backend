const asyncHandler = require("express-async-handler");
const User = require("../modles/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Please enter all fields" });
    return;
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.send({ success: false, message: "User already exists" });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      pic,
    });

    res.send({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.send({ error: "Failed to create user" });
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  try {
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          pic: user.pic,
        },
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ error: "No user found", error: error.message });
  }
});

module.exports = { registerUser, authUser };
