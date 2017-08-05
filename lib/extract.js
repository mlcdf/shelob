const bluebird = require('bluebird');
const cheerio = require('cheerio');
const got = require('got');

const models = require('./models');

async function extractStats(username, category) {
  const url = `https://www.senscritique.com/${username}/collection/rating/${category}/all/all/all/all/all/all/all/page-1`;

  try {
    const response = await got(url);
  } catch (err) {
    err.message = 'SensCritique is unavailable';
    throw err;
  }

  const $ = cheerio.load(response.body);

  const stats = {
    watchlisted: parseInt(
      $('[data-sc-collection-filter="wish"] span span')
        .text()
        .trim()
        .slice(1, -1)
    ),
    rated: parseInt(
      $('[data-sc-collection-filter="rating"] span span')
        .text()
        .trim()
        .slice(1, -1)
    ),
    finished: parseInt(
      $('[data-sc-collection-filter="done"] span span')
        .text()
        .trim()
        .slice(1, -1)
    )
  };

  for (let key of Object.keys(stats)) {
    if (Object.is(stats[key], NaN)) {
      stats[key] = 0;
    }
  }

  return stats;
}

module.exports = async function(username, category) {
  const collection = [];

  const stats = await extractStats(username, category);
  const pages = Math.ceil(stats['rated'] / 18);
  const indexes = Array.from({ length: pages }, (v, k) => k + 1);

  const model = models[models.categoryToModels[category]];
  const keys = Object.keys(model);

  return await bluebird
    .map(indexes, async function(index, callback) {
      const url =
        `https://www.senscritique.com/${username}/collection/rating/${category}/all/all/all/all/all/all/all/page-` +
        index;
      const response = await got(url);
      const $ = cheerio.load(response.body);

      $('.elco-collection-item').each(function() {
        const json = Object.create(model);
        let index = 0;

        json[keys[index++]] = $(this).find('.elco-title a').text().trim();

        if (!['morceaux', 'albums'].includes(category)) {
          json[keys[index++]] =
            $(this).find('.elco-original-title').text().trim() !== ''
              ? $(this).find('.elco-original-title').text().trim()
              : json[keys[0]];
        }

        json[keys[index++]] = parseInt(
          $(this).find('.elco-date').text().trim().slice(1, -1)
        );

        json[keys[index++]] = $(this)
          .find('.elco-product-detail a.elco-baseline-a')
          .text()
          .trim();

        json[keys[index++]] = parseInt(
          $(this)
            .find('.elco-collection-rating.user > a > div > span')
            .text()
            .trim()
        );
        collection.push(json);
      });
    })
    .then(() => {
      return { username, category, stats, collection };
    });
};
