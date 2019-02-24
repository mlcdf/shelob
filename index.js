const { send } = require('micro');
const { router, get } = require('microrouter');
const { extract, toCSV } = require('./lib');

const help = {
  usage: 'GET /:username/:category/:filter',
  documentation: 'https://github.com/mlcdf/shelob#usage'
};

class Validator {
  constructor(req) {
    // Request to validate
    this.req = req;
  }

  // Set a default errorId
  get errorId() {
    return 'invalid_parameter';
  }
}

class NoInvalidCategory extends Validator {
  constructor(req) {
    super(req);

    this.allowedCategories = [
      'films',
      'series',
      'bd',
      'livres',
      'albums',
      'morceaux'
    ];
  }

  get errorMessage() {
    return `Expected ${this.allowedCategories.join('|')}, got ${
      this.req.params.category
    }`;
  }

  isValid() {
    if (!this.allowedCategories.includes(this.req.params.category)) {
      return false;
    }
    return true;
  }
}

class NoConflictingExportParameter extends Validator {
  constructor(req) {
    super(req);
  }

  get errorMessage() {
    return "The Letterboxd export is only available for the 'films' category";
  }

  isValid() {
    if (
      this.req.query.exportWebsite === 'letterboxd' &&
      this.req.params.category !== 'films'
    ) {
      return false;
    }

    return true;
  }
}

class NoInvalidExportParameter extends Validator {
  constructor(req) {
    super(req);
  }
  get errorMessage() {
    return 'Invalid optional exportWebsite paramater. Should be either empty or `letterboxd`';
  }

  isValid() {
    if (
      this.req.query.exportWebsite &&
      this.req.query.exportWebsite !== 'letterboxd'
    ) {
      return false;
    }
    return true;
  }
}

class NoInvalidFilterParameter extends Validator {
  constructor(req) {
    super(req);
  }

  get errorMessage() {
    return 'Invalid filter parameter. Should be either `done` or `filter`';
  }

  isValid() {
    if (!['done', 'wish'].includes(this.req.params.filter)) {
      return false;
    }
    return true;
  }
}

/**
 *  Validate the request parameters
 * @param {*} req
 */
const validateReq = req => {
  rules = [
    new NoInvalidCategory(req),
    new NoConflictingExportParameter(req),
    new NoInvalidExportParameter(req),
    new NoInvalidFilterParameter(req)
  ];

  errors = [];

  for (const rule of rules) {
    if (!rule.isValid()) {
      errors.push({
        id: rule.errorId,
        message: rule.errorMessage
      });
    }
  }

  return errors;
};

// GET /
const index = (req, res) => {
  send(res, 200, help);
};

// GET /*
const notFound = (req, res) => {
  send(res, 404, {
    message: 'Not found',
    usage: help.usage,
    documentation: help.documentation
  });
};

// GET /:username/:category/:filter/:exportWebsite?
const api = async (req, res) => {
  req.errors = validateReq(req);

  if (req.errors.length > 0) {
    return send(res, 400, { ok: false, errors });
  }

  await extract(
    req.params.username,
    req.params.category,
    req.params.filter,
    req.query
  )
    .then(data => {
      if (req.query.exportWebsite === 'letterboxd') {
        data = toCSV(data, req.params.filter);
        res.setHeader(
          'Content-disposition',
          `attachment; filename=${
            req.params.filter === 'done' ? 'watched' : 'wishlist'
          }.csv`
        );
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      }
      send(res, 200, data);
    })
    .catch(err => {
      if (err.id) {
        return send(res, err.statusCode, {
          errors: [{ id: err.id, message: err.message }]
        });
      }
      console.log(err);
      throw err;
    });
};

const decorateWithHeaders = handler => (req, res) => {
  const referer = req.headers.referer;

  if (!referer || referer === '') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', referer);
  }

  return handler(req, res);
};

module.exports = router(
  get('/', decorateWithHeaders(index)),
  get('/:username/:category/:filter', decorateWithHeaders(api)),
  get('/*', decorateWithHeaders(notFound))
);
