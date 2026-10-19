import jwt from "jsonwebtoken";

/**
 * Returns the configured JWT secret.
 * In production, enforces that JWT_SECRET is explicitly provided.
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET environment variable is missing in production.");
    }
    // Secure development default (at least 32 characters)
    return "janmitra-dev-secret-key-do-not-use-in-production-min-32-chars";
  }
  return secret;
};

/**
 * Authentication middleware: verifies Bearer token and attaches decoded claims to req.user
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
    }
    next();
  };
};

/**
 * Designation-based authorization middleware (for officials: Block, District, State, Owner)
 */
export const requireDesignation = (...designations) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!designations.includes(req.user.designation)) {
      return res.status(403).json({ error: "Forbidden. Higher administrative designation required." });
    }
    next();
  };
};
