const fs = require('fs');

const { send } = require('micro');
const { router, get } = require('microrouter');
const extract = require('./lib/extract');

const setHeaders = handler => (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return handler(req, res);
};

const index = (req, res) => {
  send(res, 200, {
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
  });
};

const api = async (req, res) => {
  await extract(req.params.username, req.params.category)
    .then(data => {
      if (req.query.pretty === 'false') {
        send(res, 200, data);
      } else {
        send(res, 200, JSON.stringify(data, null, '  '));
      }
    })
    .catch(e => {
      console.log(e);
      send(res, 500, { message: 'Something happened' });
    });
};

const notFound = (req, res) => send(res, 404, { message: 'Not found' });

module.exports = router(
  get('/:username/:category', setHeaders(api)),
  get('/', setHeaders(index)),
  get('/*', setHeaders(notFound))
);
