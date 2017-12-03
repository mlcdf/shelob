const { send } = require('micro');
const { router, get } = require('microrouter');
const { exportLetterboxd } = require('./export');
const extract = require('./extract');

/**
 * Act as a decorator to add headers a request handler
 * @param {*} handler - a request handler
 */
const setJsonHeaders = handler => (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return handler(req, res);
};

const setCsvHeaders = handler => (req, res) => {
  let csvName = '';

  if (req.params.exportWebsite === 'letterboxd') {
    if (req.params.filter === 'done') {
      csvName = 'letterboxd-watched_films-export';
    } else if (req.params.filter === 'wish') {
      csvName = 'letterboxd-watchlist-export';
    }
  }

  res.setHeader('Content-disposition', `attachment; filename=${csvName}.csv`);
  res.setHeader('Content-Type', 'text/csv');
  return handler(req, res);
};


const help = {
  usage: 'GET /:username/:category/:filter',
  documentation: 'https://github.com/mlcdf/shelob#usage'
};

// GET /
const index = (req, res) => send(res, 200, help);

// GET /*
const notFound = (req, res) => send(res, 404, { message: 'Not found' , usage: help.usage, documentation: help.documentation });

const api = async (res, username, category, filter, exportWebsite) => {
  if (!['films', 'series', 'bd', 'livres', 'albums', 'morceaux'].includes(category)) {
    send(res, 400, { message: 'Invalid category parameter', documentation: help.documentation })
  }

  if (!['done', 'wish'].includes(filter)) {
    send(res, 400, { message: 'Invalid filter parameter', documentation: help.documentation })
  }

  await extract(username, category, filter)
    .then(data => {
      if (exportWebsite === 'letterboxd') {
        data = exportLetterboxd(data, filter);
        send(res, 200, data);
      } else {
        send(res, 200, data);
      }
    })
    .catch(err => {
      console.log(err);
      const code = err.statusCode ? err.statusCode : 500;
      const message = err.message ? err.message : 'Something happened';
      send(res, code, { message });
    });
};

// GET /:username/:category/:filter/:exportWebsite?
const request = (req, res) =>
  api(
    res,
    req.params.username,
    req.params.category,
    req.params.filter,
    req.params.exportWebsite
  );


module.exports = router(
  get('/', setJsonHeaders(index)),
  get('/:username/:category/:filter', setJsonHeaders(request)),
  get('/:username/:category/:filter/:exportWebsite', setCsvHeaders(request)),
  get('/*', setJsonHeaders(notFound))
);
