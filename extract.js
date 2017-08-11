const bluebird = require('bluebird');
const cheerio = require('cheerio');
const got = require('got');

module.exports = async function(username, category) {
  const collection = [];

  // Crawl the first page
  const url = `https://www.senscritique.com/${username}/collection/rating/${category}/all/all/all/all/all/all/all/page-1`;
  let response;

  try {
    response = await got(url);
  } catch (err) {
    err.message = 'SensCritique is unavailable';
    throw err;
  }

  // Then extract data from the first page
  const stats = extractStats(response.body);
  collection.push(...extractItems(response.body, category));

  const nbOfPages = Math.ceil(stats['rated'] / 18); // 18 being the number of item per page

  if (nbOfPages >= 1) {
    const indexes = Array.from({ length: nbOfPages }, (v, k) => k + 2); // Build a [] from 2 => nbOfPages

    await bluebird.map(indexes, async function(index, callback) {
      const url =
        `https://www.senscritique.com/${username}/collection/rating/${category}/all/all/all/all/all/all/all/page-` +
        index;
      const response = await got(url);
      const items = extractItems(response.body, category);
      collection.push(...items);
    });
  }

  return { stats, collection };
};

/**
 * Extract some stats on the user's collection
 * @param {String} data
 */
function extractStats(data) {
  const $ = cheerio.load(data);

  const stats = {
    watchlisted: $('[data-sc-collection-filter="wish"] span span'),
    rated: $('[data-sc-collection-filter="rating"] span span'),
    finished: $('[data-sc-collection-filter="done"] span span')
  };

  for (let key of Object.keys(stats)) {
    stats[key] = parseInt(stats[key].text().trim().slice(1, -1)); // Remove \t, spaces, and ()
    if (Object.is(stats[key], NaN)) {
      stats[key] = 0;
    }
  }

  return stats;
}

/**
 * Extract all the items (ie movies, books, ...) from a HTML page
 * @param {String} data
 */
function extractItems(data, category) {
  const $ = cheerio.load(data);
  const items = [];

  $('.elco-collection-item').each(function() {
    const item = Object.create({});

    item.frenchTitle = $(this).find('.elco-title a').text().trim();

    if (!['morceaux', 'albums'].includes(category)) {
      const originalTitle = $(this).find('.elco-original-title').text().trim();
      item.originalTitle =
        originalTitle !== '' ? originalTitle : item.frenchTitle;
    }

    item.year = parseInt($(this).find('.elco-date').text().trim().slice(1, -1));

    const creators = [];
    $(this).find('.elco-product-detail a.elco-baseline-a').each(function() {
      creators.push($(this).text().trim());
    });
    item[creatorLabel(category)] = creators;

    item.rating = parseInt(
      $(this).find('.elco-collection-rating.user > a > div > span').text()
    );

    items.push(item);
  });

  return items;
}

/**
 * Figure out which label to use for the field `creators`
 * @param {String} category
 */
function creatorLabel(category) {
  if (category === 'films') {
    return 'directors';
  }
  if (category === 'bd') {
    return 'illustrators';
  }
  return 'creators';
}
