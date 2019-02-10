const createError = (code, stringId, message) => {
  const err = new Error(message);

  err.statusCode = code;
  err.stringId = stringId;

  return err;
};

module.exports = {
  createError
};
