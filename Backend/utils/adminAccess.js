const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

const ADMIN_STATIC_EMAIL = normalizeEmail(process.env.ADMIN_STATIC_EMAIL || "saikausikimaddula80@gmail.com");
const ADMIN_STATIC_PASSWORD = process.env.ADMIN_STATIC_PASSWORD || "kausiki@2006";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(normalizeEmail)
  .filter(Boolean);

if (ADMIN_STATIC_EMAIL && !ADMIN_EMAILS.includes(ADMIN_STATIC_EMAIL)) {
  ADMIN_EMAILS.push(ADMIN_STATIC_EMAIL);
}

const isAdminEmail = (email) => ADMIN_EMAILS.includes(normalizeEmail(email));

const getAdminEmails = () => [...ADMIN_EMAILS];

module.exports = {
  ADMIN_STATIC_EMAIL,
  ADMIN_STATIC_PASSWORD,
  ADMIN_EMAILS,
  isAdminEmail,
  getAdminEmails,
  normalizeEmail,
};
