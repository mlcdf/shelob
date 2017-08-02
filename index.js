const { send } = require('micro');
const { router, get } = require('microrouter');
const querystring = require('querystring');
const stringifyObject = require('stringify-object');
const url = require('url');

const extract = require('./lib/extract');

const index = async (req, res) => {
  const query = querystring.parse(url.parse(req.url).query);
  await extract(req.params.username, req.params.category)
    .then(data => {
      if (query.pretty === 'true') {
        const pretty = stringifyObject(data, {
          indent: '  ',
          singleQuotes: false
        });
        send(res, 200, pretty);
      } else {
        send(res, 200, data);
      }
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
