const { send } = require('micro');
const qs = require('querystring');
const url = require('url');

const extract = require('./lib/extract');

module.exports = async (req, res) => {
  const query = qs.parse(url.parse(req.url).query);
  extract(query.username, query.category)
    .then(data => {
      send(res, 200, data);
    })
    .catch(() => {
      send(res, 500, { error: 'Something happened.' });
    });
};
