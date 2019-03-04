const express = require('express');

const { extract, toCSV } = require('./lib');

// Validator is a base class. It should be extended to defined a new Validator.
// Each extended classes should implement both:
// get errorMessage() {}
// function isValid() {}
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
  const rules = [
    new NoInvalidCategory(req),
    new NoConflictingExportParameter(req),
    new NoInvalidExportParameter(req),
    new NoInvalidFilterParameter(req)
  ];

  const errors = [];

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

const docs = 'https://github.com/mlcdf/shelob#usage';

const app = express();

app.use((req, res, next) => {
  const referer = req.headers.referer;

  if (!referer || referer === '') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', referer);
  }
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({ docs });
});

// GET /:username/:category/:filter/:exportWebsite?
app.get('/:username/:category/:filter', (req, res, next) => {
  req.errors = validateReq(req);

  if (req.errors.length > 0) {
    return res.status(400).json({ errors: req.errors });
  }

  extract(
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
      res.status(200).json(data);
    })
    .catch(next);
});

app.get('/*', (req, res) => {
  res.status(404).json({ docs, message: 'Not found' });
});

// prettier-ignore
app.use((err, req, res, next) => { // eslint-disable-line
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.status(err.statusCode || 500)

  // if the error object has an id, it's a custom error created via createError()
  if (err.id) {
    return res.json({
      errors: [{ id: err.id, message: err.message }]
    });
  }
  return res.send("Unexpected error.")
});

module.exports = app;
