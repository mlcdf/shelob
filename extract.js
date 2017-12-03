const bluebird = require('bluebird');
const cheerio = require('cheerio');
const got = require('got');

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

function collectionSize(html, filter) {
  const $ = cheerio.load(html);

  let numberOfEntries = parseInt(
    $(`[data-sc-collection-filter=${filter}] span span`)
      .text()
      .trim()
      .slice(1, -1)
  );

  if (Object.is(numberOfEntries, NaN)) {
    numberOfEntries = 0;
  }

  return numberOfEntries;
}

/**
 * Extract all the items (ie movies, books, ...) from a HTML page
 * @param {String} html
 * @param {String} category
 * @param {String} filter
 */
function extractItems(html, category, filter) {
  const $ = cheerio.load(html);
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

    if (filter === 'done') {
      item.rating = parseInt(
        $(this).find('.elco-collection-rating.user > a > div > span').text()
      );
    }

    items.push(item);
  });

  return items;
}

module.exports = async function(username, category, filter) {
  const collection = [];
  const url = `https://www.senscritique.com/${username}/collection/${filter}/${category}/all/all/all/all/all/all/all/page-`;
  let response;

  // Crawl the first page
  try {
    response = await got(url + '1', { timeout: 20000 });
  } catch (err) {
    err.message = 'SensCritique is unavailable';
    throw err;
  }

  // Then extract data from the first page
  collection.push(...extractItems(response.body, category, filter));

  // 18 being the number of item per page
  const nbOfPages = Math.ceil(collectionSize(response.body, filter) / 18);

  if (nbOfPages >= 1) {
    // Build a [] from 2 => nbOfPages
    const indexes = Array.from({ length: nbOfPages }, (v, k) => k + 2);

    await bluebird.map(indexes, async index => {
      response = await got(url + index, { timeout: 20000 });
      const items = extractItems(response.body, category, filter);
      collection.push(...items);
    });
  }

  return collection;
};
