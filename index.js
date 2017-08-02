const { send } = require('micro');
const { router, get } = require('microrouter');
const url = require('url');

const extract = require('./lib/extract');

const index = async (req, res) => {
  await extract(req.params.username, req.params.category)
    .then(data => {
      send(res, 200, data);
    })
    .catch(() => {
      send(res, 500, { error: 'Something happened' });
    });
};
const notFound = (req, res) => send(res, 404, { message: 'Not found' });

module.exports = router(
  get('/:username/:category', index),
  get('/*', notFound)
);
