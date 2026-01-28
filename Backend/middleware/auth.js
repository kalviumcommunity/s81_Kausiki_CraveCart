const jwt = require("jsonwebtoken");
const { UserModel } = require("../model/userModel");
const ErrorHandler = require("../utils/errorhadler");

const getTokenFromReq = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  // Fallbacks: cookie set by login and query param used by some flows
  if (req.cookies && req.cookies.accesstoken) return req.cookies.accesstoken;
  if (req.query && req.query.token) return req.query.token;

  return null;
};

const requireAuth = async (req, res, next) => {
  try {
    if (!process.env.SECRET) {
      return next(new ErrorHandler("Server auth misconfigured (SECRET missing)", 500));
    }

    const token = getTokenFromReq(req);
    if (!token) {
      return next(new ErrorHandler("Unauthorized", 401));
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) {
      return next(new ErrorHandler("Unauthorized", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err && (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError")) {
      return next(new ErrorHandler("Unauthorized", 401));
    }
    return next(new ErrorHandler("Unauthorized", 401));
  }
};

const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return next(new ErrorHandler("Unauthorized", 401));
    if (!allowed.includes(req.user.role)) {
      return next(new ErrorHandler("Forbidden", 403));
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
