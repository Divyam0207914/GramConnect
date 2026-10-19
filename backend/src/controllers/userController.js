import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getJwtSecret } from "../middleware/auth.js";

export const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password, location } = req.body;
    
    // Enforce citizen role for public registration
    const role = "citizen";
    
    // Validate location data
    if (!location || !location.state || !location.district || !location.block) {
      return res.status(400).json({ 
        message: "Location information is required (state, district, block)",
        received: location 
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "E-mail already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate user hash from user data including location
    const userData = JSON.stringify({ 
      name, 
      phone, 
      email, 
      password: hashedPassword,
      location 
    });
    const hash = crypto.createHash("sha256").update(userData).digest("hex");
    
    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      location,
      hash
    });

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.hash;

    res.status(201).json({ message: "User registered successfully", user: sanitizedUser });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, location: user.location },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.hash;

    res.json({ message: "Login successful", token, user: sanitizedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id name email phone location role createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Direct object reference check: user can only edit self unless Owner
    if (req.user.id !== id && req.user.designation !== "Owner") {
      return res.status(403).json({ error: "Unauthorized. You can only update your own profile." });
    }

    const existingUser = await User.findById(id);
    if (!existingUser) return res.status(404).json({ message: "User not found." });

    // Strict field whitelisting to prevent mass assignment
    const allowedFields = ["name", "phone", "location"];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (req.body.password && typeof req.body.password === "string" && req.body.password.length >= 6) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }
    
    // Recalculate hash when identity or location data changes
    if (updateData.location || updateData.name || updateData.phone || updateData.password) {
      const userData = JSON.stringify({
        name: updateData.name || existingUser.name,
        phone: updateData.phone || existingUser.phone,
        email: existingUser.email,
        password: updateData.password || existingUser.password,
        location: updateData.location || existingUser.location
      });
      updateData.hash = crypto.createHash("sha256").update(userData).digest("hex");
      updateData.lastSynced = new Date();
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password -hash");
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Only Owner official or account holder can delete account
    if (req.user.designation !== "Owner" && req.user.id !== id) {
      return res.status(403).json({ error: "Unauthorized. Only Owner or account holder can delete this account." });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
