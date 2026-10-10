const HttpError = require('../utils/HttpError');

function notFound(_req, _res, next) {
  next(new HttpError(404, 'Route not found.'));
}

function errorHandler(error, _req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'This record already exists.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Please check the submitted details.' });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }
  // Avoid exposing database URIs, request payloads, secrets, or stack traces.
  console.error('An unexpected API error occurred.');
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

module.exports = { notFound, errorHandler };
