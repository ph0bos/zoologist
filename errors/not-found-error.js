/**
 * `NotFoundError` error.
 *
 * @constructor
 * @param {String} [message]
 * @api public
 */
function NotFoundError(message, code) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'NotFoundError';
  this.message = message || code;
  this.code = code || 'ENOTFOUND';
}

/**
 * Inherit from `Error`.
 */
NotFoundError.prototype.__proto__ = Error.prototype;


/**
 * Expose `NotFoundError`.
 */
module.exports = NotFoundError;
