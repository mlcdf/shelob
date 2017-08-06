const bluebird = require('bluebird');
const cheerio = require('cheerio');
const got = require('got');

async function extractStats(username, category) {
  console.log(`${username}/${category}`);
  const url = `https://www.senscritique.com/${username}/collection/rating/${category}/all/all/all/all/all/all/all/page-1`;
  let response;

  try {
    response = await got(url);
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

  return await bluebird
    .map(indexes, async function(index, callback) {
      const url =
        `https://www.senscritique.com/${username}/collection/rating/${category}/all/all/all/all/all/all/all/page-` +
        index;
      const response = await got(url);
      const $ = cheerio.load(response.body);

      $('.elco-collection-item').each(function() {
        const creativeWork = Object.create({});

        creativeWork.frenchTitle = $(this).find('.elco-title a').text().trim();

        if (!['morceaux', 'albums'].includes(category)) {
          const originalTitle = $(this)
            .find('.elco-original-title')
            .text()
            .trim();
          creativeWork.originalTitle =
            originalTitle !== '' ? originalTitle : creativeWork.frenchTitle;
        }

        creativeWork.year = parseInt(
          $(this).find('.elco-date').text().trim().slice(1, -1)
        );

        const creators = [];
        $(this).find('.elco-product-detail a.elco-baseline-a').each(function() {
          creators.push($(this).text().trim());
        });
        creativeWork[creatorLabel(category)] = creators;

        creativeWork.rating = parseInt(
          $(this).find('.elco-collection-rating.user > a > div > span').text()
        );

        collection.push(creativeWork);
      });
    })
    .then(() => {
      return { username, category, stats, collection };
    });
};

function creatorLabel(category = '') {
  if (category == 'films') {
    return 'directors';
  }
  if (category === 'bd') {
    return 'illustrators';
  }
  return 'creators';
}
