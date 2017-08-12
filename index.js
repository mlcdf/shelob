const fs = require('fs');

const { send } = require('micro');
const { router, get } = require('microrouter');
const extract = require('./extract');
const findIMDBId = require('./find-imdb-id');

/**
 * Act as a decorator to add headers a request handler
 * @param {*} handler - a request handler
 */
const setHeaders = handler => (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return handler(req, res);
};

const prettify = object => JSON.stringify(object, null, '  ');

const about = {
  name: 'Shelob',
  description: "Extract your data (or someone else's) from senscritique.com",
  usage: 'GET /:username/:category',
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

const api = async (res, username, category, filter, pretty) => {
  await extract(username, category, filter)
    .then(data => {
      send(res, 200, pretty === 'false' ? data : prettify(data));
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

// GET :username/:category/done
const collection = (req, res) =>
  api(res, req.params.username, req.params.category, 'done', req.params.pretty);

// GET /:username/:category/wish
const wishlist = (req, res) =>
  api(res, req.params.username, req.params.category, 'wish', req.params.pretty);

// GET /*
const notFound = (req, res) =>
  send(res, 404, prettify({ code: 404, message: 'Not found' }));

module.exports = router(
  get('/', setHeaders(index)),
  get('/:username/:category/done', setHeaders(collection)),
  get('/:username/:category/wish', setHeaders(wishlist)),
  get('/*', setHeaders(notFound))
);
