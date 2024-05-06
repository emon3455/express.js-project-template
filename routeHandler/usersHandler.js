const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = require("../schemas/userSchema");
const router = express.Router();

const User = new mongoose.model("User", userSchema);

//get all user:
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: "Success",
      result: users,
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error..!",
    });
  }
});

// signup
router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newuser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
    });
    await newuser.save();
    res.status(200).json({
      message: "User Created Successfully",
    });
  } catch (err) {
    // Check if the error is due to a duplicate key violation
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      // Duplicate email error
      res.status(400).json({
        error: "Email already exists. Please provide different one.",
      });
    } else {
      // Other errors
      res.status(500).json({
        error: "Signup Failed..!",
      });
    }
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });
    if (user && user.length > 0) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user[0].password
      );
      if (isValidPassword) {
        // generate a token and send to the user

        const token = jwt.sign(
          { email: user[0].email, userId: user[0]._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.status(200).json({
          accessToken: token,
          message: "User LogedIn Successfully",
          user: user[0],
          isLogin: true,
        });
      } else {
        res.status(500).json({
          error: "Login Failed..!",
        });
      }
    } else {
      res.status(500).json({
        error: "Login Failed..!",
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error..!",
    });
  }
});

module.exports = router;
