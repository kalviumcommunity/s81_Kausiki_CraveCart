const ErrorHandler = require("./errorhadler");

const startOfDayUTC = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const parseDateOnlyUTC = (value) => {
  if (!value) return startOfDayUTC(new Date());

  // Expected input: YYYY-MM-DD
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) throw new ErrorHandler("Invalid date format. Use YYYY-MM-DD", 400);
    const [_, yyyy, mm, dd] = match;
    return new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new ErrorHandler("Invalid date", 400);
  return startOfDayUTC(d);
};

module.exports = { parseDateOnlyUTC, startOfDayUTC };
