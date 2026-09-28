module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Handle multer errors cleanly
    if (err && err.name === 'MulterError') {
        err.statusCode = 400;
        err.message = err.message || 'File upload error';
    }

    // Handle Mongo duplicate key errors
    if (err && err.code === 11000) {
        err.statusCode = 400;
        const keys = Object.keys(err.keyValue || {});
        err.message = keys.length ? `Duplicate field value entered for ${keys.join(", ")}.` : "Duplicate entry detected.";
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};