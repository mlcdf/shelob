const fs = require('fs');

const { send } = require('micro');
const { router, get } = require('microrouter');
const extract = require('./extract');

const setHeaders = handler => (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return handler(req, res);
};

const pretty = data => JSON.stringify(data, null, '  ');

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

const index = (req, res) => send(res, 200, pretty(about));

const api = async (req, res) => {
  await extract(req.params.username, req.params.category)
    .then(({ stats, collection }) => {
      const json = {
        username: req.params.username,
        category: req.params.category,
        stats,
        collection
      };
      send(res, 200, req.query.pretty === 'false' ? json : pretty(json));
    })
    .catch(err => {
      console.log(err);
      const json = {
        code: err.statusCode ? err.statusCode : 500,
        message: err.message ? err.message : 'Something happened'
      };
      send(res, json.code, pretty(json));
    });
};

const notFound = (req, res) =>
  send(res, 404, pretty({ code: 404, message: 'Not found' }));

module.exports = router(
  get('/:username/:category', setHeaders(api)),
  get('/', setHeaders(index)),
  get('/*', setHeaders(notFound))
);
