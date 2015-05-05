/**
 * `ZooKeeperError` error.
 *
 * @constructor
 * @param {String} [message]
 * @api public
 */
function ZooKeeperError(message, code) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'ZooKeeperError';
  this.message = message || '' + code;
  this.code = code;
}

/**
 * Inherit from `Error`.
 */
ZooKeeperError.prototype.__proto__ = Error.prototype;


/**
 * Expose `ZooKeeperError`.
 */
module.exports = ZooKeeperError;
