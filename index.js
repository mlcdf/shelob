const { send } = require('micro');
const { router, get } = require('microrouter');
const { exportLetterboxd } = require('./export');
const { extract } = require('./extract');
const { AppError } = require('./errors');

const help = {
  usage: 'GET /:username/:category/:filter',
  documentation: 'https://github.com/mlcdf/shelob#usage'
};

/**
 *  Validate the request parameters
 * @param {*} params
 */
const validateParams = req => {
  if (
    !['films', 'series', 'bd', 'livres', 'albums', 'morceaux'].includes(
      req.params.category
    )
  ) {
    throw new AppError(
      400,
      'Invalid category parameter. Should be either `films`, `series`, `bd`, `livres`, `albums` or `morceaux`.'
    );
  }

  if (!['done', 'wish'].includes(req.params.filter)) {
    throw new AppError(
      400,
      'Invalid filter parameter. Should be either `done` or `filter`.'
    );
  }

  if (req.params.exportWebsite && req.params.exportWebsite !== 'letterboxd') {
    throw new AppError(
      400,
      'Invalid optional exportWebsite paramater. Should be either empty or `letterboxd`'
    );
  }

  if (
    req.query.exportWebsite === 'letterboxd' &&
    req.params.category !== 'films'
  ) {
    throw new AppError(
      400,
      'The Letterboxd export is only available for the `films` category. Please remove this query param.'
    );
  }
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
  try {
    validateParams(req);
  } catch (err) {
    send(res, err.statusCode, {
      message: err.message,
      documentation: help.documentation
    });
  }

  await extract(req.params.username, req.params.category, req.params.filter)
    .then(data => {
      if (req.query.exportWebsite === 'letterboxd') {
        data = exportLetterboxd(data, req.params.filter);
        res.setHeader(
          'Content-disposition',
          `attachment; filename=${req.params.filter === 'done'
            ? 'watched'
            : 'wishlist'}.csv`
        );
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      }
      send(res, 200, data);
    })
    .catch(() => {
      throw new AppError();
    });
};

const decorateWithHeaders = handler => (req, res) => {
  const referer = req.headers['referer'];

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
