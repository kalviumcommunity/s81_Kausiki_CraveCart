const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ErrorHandler = require("../utils/errorhadler");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(UPLOAD_ROOT);

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "video/mp4",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Group by owner user id so we don't need kitchenId upfront
    const ownerId = req.user?._id ? String(req.user._id) : "anonymous";
    const dir = path.join(UPLOAD_ROOT, "kitchens", ownerId);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${ts}_${safeOriginal}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new ErrorHandler("Unsupported file type. Use PDF/JPG/PNG/MP4", 400));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
  },
});

const fileMeta = (file) => {
  if (!file) return null;
  return {
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    urlPath: `/uploads/kitchens/${String(reqUserIdSafe(file))}/${file.filename}`,
    uploadedAt: new Date(),
  };
};

const reqUserIdSafe = (file) => {
  // file.path: .../uploads/kitchens/<ownerId>/<filename>
  const parts = file.path.split(path.sep);
  const idx = parts.lastIndexOf("kitchens");
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  return "unknown";
};

const buildFileDoc = (file) => {
  if (!file) return null;
  return {
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    urlPath: `/uploads/kitchens/${reqUserIdSafe(file)}/${file.filename}`,
    uploadedAt: new Date(),
  };
};

module.exports = { upload, buildFileDoc };
