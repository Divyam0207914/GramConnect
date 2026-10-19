import Official from "../models/official.model.js";
import Complaint from "../models/complaint.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../middleware/auth.js";

export const getDashboard = async (req, res) => {
  try {
    // Derive role, designation, department, and location strictly from verified token
    const { designation, department, location } = req.user;
    
    // Map department to complaint categories
    const departmentToCategoryMap = {
      "Water Supply": "water",
      "Electricity": "electricity",
      "Public Works": "roads",
      "Health": "healthcare",
      "Education": "education",
      "General": "other"
    };
    
    let filter = {};
    
    // Owner sees everything - with optional department filtering from query
    if (designation === "Owner") {
      if (req.query.department && departmentToCategoryMap[req.query.department]) {
        filter.category = departmentToCategoryMap[req.query.department];
      }
      const complaints = await Complaint.find(filter);
      return res.json({ 
        total: complaints.length, 
        complaints,
        department: req.query.department || 'all',
        designation: 'Owner',
        filteredBy: req.query.department ? departmentToCategoryMap[req.query.department] : null,
        level: 'all',
        note: 'Owner has universal access'
      });
    }
    
    // For non-Owner officials: strictly enforce their assigned department, designation, and location
    if (department && departmentToCategoryMap[department]) {
      filter.category = departmentToCategoryMap[department];
    }
    
    if (designation && ["Block", "District", "State"].includes(designation)) {
      filter.currentLevel = designation;
    }
    
    if (location) {
      if (designation === "Block" && location.block) {
        filter["location.block"] = location.block;
        filter["location.district"] = location.district;
        filter["location.state"] = location.state;
      } else if (designation === "District" && location.district) {
        filter["location.district"] = location.district;
        filter["location.state"] = location.state;
      } else if (designation === "State" && location.state) {
        filter["location.state"] = location.state;
      }
    }
    
    const complaints = await Complaint.find(filter);
    
    res.json({ 
      total: complaints.length, 
      complaints,
      department: department || 'all',
      designation: designation || 'all',
      filteredBy: department ? departmentToCategoryMap[department] : null,
      level: designation || 'all'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerOfficial = async (req, res) => {
  try {
    const { name, email, password, department, designation, phone, location } = req.body;
    const existingOfficial = await Official.findOne({ email });
    if (existingOfficial) return res.status(400).json({ message: "E-mail already in use." });

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const official = await Official.create({
      name,
      email,
      password: hashedPassword,
      department,
      designation,
      phone,
      location
    });

    const sanitizedOfficial = official.toObject();
    delete sanitizedOfficial.password;

    res.status(201).json({ message: "Official registered", official: sanitizedOfficial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginOfficial = async (req, res) => {
  try {
    const { email, password } = req.body;
    const official = await Official.findOne({ email });
    if (!official) return res.status(404).json({ message: "Official not found" });

    const isMatch = await bcrypt.compare(password, official.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token with verified claims
    const token = jwt.sign(
      { 
        id: official._id, 
        role: "official", 
        name: official.name,
        department: official.department,
        designation: official.designation,
        location: official.location
      },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    const sanitizedOfficial = official.toObject();
    delete sanitizedOfficial.password;

    res.json({ message: "Login successful", token, official: sanitizedOfficial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOfficial = async (req, res) => {
  try {
    const { id } = req.params;

    // Direct object reference check: official can only edit self unless Owner
    if (req.user.id !== id && req.user.designation !== "Owner") {
      return res.status(403).json({ error: "Unauthorized. You can only update your own official profile." });
    }

    const allowedFields = ["name", "phone", "department", "location"];
    // Only Owner can modify designation of officials
    if (req.user.designation === "Owner") {
      allowedFields.push("designation");
    }

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.body.password && typeof req.body.password === "string" && req.body.password.length >= 6) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const official = await Official.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    if (!official) return res.status(404).json({ message: "Official not found" });

    res.json({ message: "Official updated", official });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteOfficial = async (req, res) => {
  try {
    const { id } = req.params;

    // Only Owner can delete official accounts
    if (req.user.designation !== "Owner") {
      return res.status(403).json({ error: "Unauthorized. Owner designation required to delete official accounts." });
    }

    const official = await Official.findByIdAndDelete(id);
    if (!official) return res.status(404).json({ message: "Official not found" });

    res.json({ message: "Official deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
