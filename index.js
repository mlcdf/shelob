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

const prettify = object => JSON.stringify(object, null, '  ');

const about = {
  name: 'Shelob',
  description: "Extract your data (or someone else's) from senscritique.com",
  usage: 'GET /:username/:category/:filter',
  docs: 'https://github.com/mlcdf/shelob#shelob',
  src: 'https://github.com/mlcdf/shelob',
  author: {
    name: 'Maxime Le Conte des Floris',
    email: 'hello@mlcdf.com',
    url: 'https://mlcdf.com'
  }
};

// GET /
const index = (req, res) => send(res, 200, prettify(about));

const api = async (res, username, category, filter, exportWebsite, pretty) => {
  await extract(username, category, filter)
    .then(data => {
      if (exportWebsite === 'letterboxd') {
        data = exportLetterboxd(data, filter);
        send(res, 200, data);
      } else {
        send(res, 200, pretty === 'false' ? data : prettify(data));
      }

    })
    .catch(err => {
      console.log(err);
      const response = {
        code: err.statusCode ? err.statusCode : 500,
        message: err.message ? err.message : 'Something happened'
      };
      send(res, response.code, prettify(response));
    });
};

// GET /:username/:category/:filter/:exportWebsite?:pretty
const request = (req, res) =>
  api(res, req.params.username, req.params.category, req.params.filter, req.params.exportWebsite, req.params.pretty);

// GET /*
const notFound = (req, res) =>
  send(res, 404, prettify({ code: 404, message: 'Not found' }));

module.exports = router(
  get('/', setJsonHeaders(index)),
  get('/:username/:category/:filter', setJsonHeaders(request)),
  get('/:username/:category/:filter/:exportWebsite', setCsvHeaders(request)),
  get('/*', setJsonHeaders(notFound))
);
