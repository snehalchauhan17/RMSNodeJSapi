
const { Router } = require('express')
const jwt = require('jsonwebtoken')
const User = require('../UserMaster/MUserMasterModel')
const router = Router()
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const argon2 = require("argon2");  // Secure hashing
const { connectToMongoClient } = require('../../dbconfig');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secretKey = process.env.DATA_SECRET; // Store securely in .env
const iv = crypto.randomBytes(16);
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../authMiddleware");
const failedAttempts = new Map(); // Store failed login attempts per user
const CryptoJS = require("crypto-js");

router.get("/RoleList", async (req, res) => {
  try {

    const db = await connectToMongoClient();
    const collection = db.collection("RoleMaster"); // Get the collection
    const results = await collection.find({}).toArray(); // Query the collection
    res.status(200).send(results); // Send the results as the response

  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Retrieve all users from the database.
router.get('/UserDetailList', authenticateToken, async (req, res) => {

  try {
    const user = await User.find();
    -
      res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Function to generate JWT tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, username: user.username, RoleId: user.RoleId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // Access token expires in 15 min
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // Refresh token lasts 7 days
  );
};

// User Registration Route
router.post(
  "/MUserMaster",
  [
    body("name").trim().notEmpty().escape().isString().withMessage("Name is required"),
    body("username").trim().notEmpty().isString().withMessage("Username is required"),
    body("password")
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
      .isStrongPassword().withMessage("Password must contain uppercase, lowercase, number, and special character"),
    body("dcode").toInt().isInt(),
    body("officeId").toInt().isInt(),
    body("branchId")
      .custom((value, { req }) => {
        const roleId = parseInt(req.body.RoleId);
        if (roleId !== 1 && (value === undefined || value === null || value === '')) {
          throw new Error("branchId is required for roles other than 1");
        }
        return true;
      })
      .optional({ checkFalsy: true })
      .toInt(),
    body("RoleId").toInt().isInt(),
  ],
  async (req, res) => {

    // Validation Errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, username, password, dcode, officeId, branchId, RoleId } = req.body;

      // Check if the username already exists
      const existingUser = await User.findOne({ username: { $regex: `^${username}$`, $options: "i" } });

      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      // Hash password using Argon2
      const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

      // Create a new user
      const user = new User({
        name,
        username,
        password: hashedPassword,
        dcode,
        officeId,
        branchId: RoleId === 1 ? null : branchId, // If RoleId is 1, branchId can be null
        RoleId,
        SessionId: ''
      });

      // Save user to DB
      const savedUser = await user.save();

      // Generate Tokens
      const accessToken = generateAccessToken(savedUser);
      const refreshToken = generateRefreshToken(savedUser);

      res.json({
        message: "Registration successful",
        user: {
          _id: savedUser._id,
          name: savedUser.name,
          username: savedUser.username,
          RoleId: savedUser.RoleId,
          dcode: savedUser.dcode,
          officeId: savedUser.officeId,
          branchId: savedUser.branchId,
          createdAt: savedUser.createdAt, // Optional: Send user creation date
        },
        accessToken, // Access Token (expires in 15 min)
        refreshToken, // Optional: Send refresh token (only if not using cookies)
      });

    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).json({ message: "Database error", error });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    // 🔹 Decrypt incoming data
    const bytes = CryptoJS.AES.decrypt(req.body.data, process.env.ENCRYPTION_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (!decryptedData.username || !decryptedData.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔹 Manually validate input

    const { username, password } = decryptedData;
    if (!username.trim() || !password.trim()) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // 🔹 Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 🔹 Verify password using Argon2
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // 🔹 Generate New Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🔹 Generate New Unique Session ID
    const SessionId = crypto.randomUUID(); // or use randomBytes if needed

    // 🔹 Update user with new sessionId
    user.SessionId = SessionId;
    await user.save();


    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        RoleId: user.RoleId,
        dcode: user.dcode,
        officeId: user.officeId,
        branchId: user.branchId,
        SessionId: SessionId
      },
      accessToken,
      refreshToken,

    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }
    // 🔹 Verify token and get user details
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }

      const user = await User.findById(decoded._id);

      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      // 🔹 Generate new tokens (without updating the session in the database)
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // 🔹 Send new tokens without modifying UserSession
      res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
  } catch (error) {
    console.error("Error in refresh token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/verifySession', async (req, res) => {
  const { sessionId, username } = req.body;

  try {
    if (!username || !sessionId) {
      return res.status(400).send({ message: 'Username and sessionId are required' });
    }

    // 🔍 Find user by username (not _id)
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (!user.SessionId || !user.username || user.SessionId !== sessionId || user.username !== username) {
      return res.status(401).send({ message: '❌ Session mismatch or tampered session.' });
    }

    // ✅ Session match
    return res.status(200).send({ message: '✅ Session is valid' });

  } catch (err) {
    console.error("🔥 verifySession error:", err);
    return res.status(500).send({ message: 'Server error', error: err.message });
  }
});

router.post('/ChangePassword', async (req, res) => {
  const { token, oldPassword, newPassword } = req.body;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, // ✅ Secure storage
    );

    const user = await User.findById(decoded._id); // Find user by decoded ID

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    // Check if old password matches
    const isMatch = await argon2.verify(user.password, oldPassword);
    if (!isMatch) {
      return res.status(400).send({ message: 'Incorrect old password' });
    }

    // Hash password using Argon2
    user.password = await argon2.hash(newPassword, { type: argon2.argon2id });

    // Save the updated user
    await user.save();

    // Respond with success message
    res.status(200).send({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error', error: err.message });
  }
});

router.post('/ResetUserPassword', async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    // Find user by username (case sensitive)
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent setting the same password as before
    const isSame = await argon2.verify(user.password, newPassword);
    if (isSame) {
      return res.status(400).json({ message: "New password must not match old password." });
    }

    // Hash and update the new password
    user.password = await argon2.hash(newPassword, { type: argon2.argon2id });
    await user.save();

    res.json({ message: `Password reset successful of User: ${user.username}` });

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
