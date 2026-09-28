const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

const ADMIN_STATIC_EMAIL = normalizeEmail(process.env.ADMIN_STATIC_EMAIL || process.env.ADMIN_NAME || "saikausikimaddula80@gmail.com");
const ADMIN_STATIC_PASSWORD = process.env.ADMIN_STATIC_PASSWORD || "kausiki@2006";

const rawAdminEmails = [
  ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : []),
  process.env.ADMIN_STATIC_EMAIL,
  process.env.ADMIN_NAME,
  "saikausikimaddula80@gmail.com",
  "cravecart05@gmail.com",
];

const ADMIN_EMAILS = Array.from(
  new Set(rawAdminEmails.map(normalizeEmail).filter(Boolean))
);

const isAdminEmail = (email) => ADMIN_EMAILS.includes(normalizeEmail(email));

const getAdminEmails = () => [...ADMIN_EMAILS];

const getAdminPasskey = async () => {
  try {
    const { SettingModel } = require("../model/settingModel");
    const setting = await SettingModel.findOne({ key: "admin_passkey" });
    if (setting && typeof setting.value === "string" && setting.value.trim().length > 0) {
      return setting.value.trim();
    }
  } catch (err) {
    // ignore if DB is not ready
  }
  return process.env.ADMIN_PASSKEY || process.env.ADMIN_STATIC_PASSWORD || "kausiki@2006";
};

const verifyAdminPasskey = async (enteredPasskey) => {
  if (!enteredPasskey || typeof enteredPasskey !== "string") return false;
  const currentKey = await getAdminPasskey();
  const trimmed = enteredPasskey.trim();
  const fallbackKey = process.env.ADMIN_PASSKEY || process.env.ADMIN_STATIC_PASSWORD || "kausiki@2006";

  return trimmed === currentKey || trimmed === fallbackKey;
};

module.exports = {
  ADMIN_STATIC_EMAIL,
  ADMIN_STATIC_PASSWORD,
  ADMIN_EMAILS,
  isAdminEmail,
  getAdminEmails,
  normalizeEmail,
  getAdminPasskey,
  verifyAdminPasskey,
};


