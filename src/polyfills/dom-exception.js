/**
 * Universal DOMException Polyfill for React Native & Hermes
 * Ensures DOMException exists on global, globalThis, and window across all engines.
 */
(function (globalScope) {
  var root =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof global !== 'undefined'
      ? global
      : typeof window !== 'undefined'
      ? window
      : globalScope || {};

  if (!root.DOMException) {
    var ERROR_NAME_TO_CODE = {
      IndexSizeError: 1,
      HierarchyRequestError: 3,
      WrongDocumentError: 4,
      InvalidCharacterError: 5,
      NoModificationAllowedError: 7,
      NotFoundError: 8,
      NotSupportedError: 9,
      InUseAttributeError: 10,
      InvalidStateError: 11,
      SyntaxError: 12,
      InvalidModificationError: 13,
      NamespaceError: 14,
      InvalidAccessError: 15,
      TypeMismatchError: 17,
      SecurityError: 18,
      NetworkError: 19,
      AbortError: 20,
      URLMismatchError: 21,
      QuotaExceededError: 22,
      TimeoutError: 23,
      InvalidNodeTypeError: 24,
      DataCloneError: 25,
    };

    function DOMException(message, name) {
      this.message = message || '';
      this.name = name || 'Error';
      this.code = ERROR_NAME_TO_CODE[this.name] || 0;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, DOMException);
      } else {
        var err = new Error();
        this.stack = err.stack;
      }
    }

    DOMException.prototype = Object.create(Error.prototype);
    DOMException.prototype.constructor = DOMException;

    var CONSTANTS = {
      INDEX_SIZE_ERR: 1,
      DOMSTRING_SIZE_ERR: 2,
      HIERARCHY_REQUEST_ERR: 3,
      WRONG_DOCUMENT_ERR: 4,
      INVALID_CHARACTER_ERR: 5,
      NO_DATA_ALLOWED_ERR: 6,
      NO_MODIFICATION_ALLOWED_ERR: 7,
      NOT_FOUND_ERR: 8,
      NOT_SUPPORTED_ERR: 9,
      INUSE_ATTRIBUTE_ERR: 10,
      INVALID_STATE_ERR: 11,
      SYNTAX_ERR: 12,
      INVALID_MODIFICATION_ERR: 13,
      NAMESPACE_ERR: 14,
      INVALID_ACCESS_ERR: 15,
      VALIDATION_ERR: 16,
      TYPE_MISMATCH_ERR: 17,
      SECURITY_ERR: 18,
      NETWORK_ERR: 19,
      ABORT_ERR: 20,
      URL_MISMATCH_ERR: 21,
      QUOTA_EXCEEDED_ERR: 22,
      TIMEOUT_ERR: 23,
      INVALID_NODE_TYPE_ERR: 24,
      DATA_CLONE_ERR: 25,
    };

    for (var key in CONSTANTS) {
      DOMException[key] = CONSTANTS[key];
      DOMException.prototype[key] = CONSTANTS[key];
    }

    root.DOMException = DOMException;
    if (typeof globalThis !== 'undefined') globalThis.DOMException = DOMException;
    if (typeof global !== 'undefined') global.DOMException = DOMException;
    if (typeof window !== 'undefined') window.DOMException = DOMException;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : this);
