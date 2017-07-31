const { send } = require('micro');
const qs = require('querystring');
const url = require('url');

const extractMovies = require('./lib/extract-movies');

module.exports = async (req, res) => {
  const query = qs.parse(url.parse(req.url).query);

  extractMovies(query.username)
    .then(data => {
      send(res, 200, data);
    })
    .catch(() => {
      send(res, 500, { error: 'Something happened.' });
    });
};
