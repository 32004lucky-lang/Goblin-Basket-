import User from "../model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";

export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please fill in all required fields (name, email, password)",
    });
  }

  const cleanEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    return res.status(400).json({
      message: "User with this email already exists. Please log in.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E23774&color=fff`;

  const user = await User.create({
    name,
    email: cleanEmail,
    password: hashedPassword,
    image: avatar,
  });

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.status(201).json({
    message: "Registration successful",
    token,
    user,
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const { email, password, code } = req.body;

  if (email && password) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid email or password",
        });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
    }

    const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
      expiresIn: "15d",
    });

    return res.status(200).json({
      message: "Logged in successfully",
      token,
      user,
    });
  }

  if (code) {
    try {
      const googleRes = await oauth2client.getToken(code);
      oauth2client.setCredentials(googleRes.tokens);

      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
      );
      const { email: googleEmail, name, picture } = userRes.data;

      let user = await User.findOne({ email: googleEmail.toLowerCase() });

      if (!user) {
        user = await User.create({
          name,
          email: googleEmail.toLowerCase(),
          image: picture,
        });
      }

      const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
        expiresIn: "15d",
      });

      return res.status(200).json({
        message: "Logged Success",
        token,
        user,
      });
    } catch (err) {
      return res.status(400).json({
        message: "Google login failed",
      });
    }
  }

  return res.status(400).json({
    message: "Email and password are required",
  });
});

const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.json({ user, token });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  res.json(user);
});
