module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Handle multer errors cleanly
    if (err && err.name === 'MulterError') {
        err.statusCode = 400;
        err.message = err.message || 'File upload error';
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};