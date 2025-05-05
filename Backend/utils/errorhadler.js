class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // Corrected constructor reference
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;