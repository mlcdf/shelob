const cheerio = require('cheerio');
const got = require('got');

const createError = (code, id, message) => {
  const err = new Error(message);

  err.statusCode = code;
  err.id = id;

  return err;
};

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

    item.id = parseInt(
      $(this)
        .find('.elco-collection-content > .elco-collection-poster')
        .attr('data-sc-product-id')
    );

    item.frenchTitle = $(this)
      .find('.elco-title a')
      .text()
      .trim();

    if (!['morceaux', 'albums'].includes(category)) {
      const originalTitle = $(this)
        .find('.elco-original-title')
        .text()
        .trim();
      item.originalTitle =
        originalTitle !== '' ? originalTitle : item.frenchTitle;
    }

    item.year = parseInt(
      $(this)
        .find('.elco-date')
        .text()
        .trim()
        .slice(1, -1)
    );

    const creators = [];
    $(this)
      .find('.elco-product-detail a.elco-baseline-a')
      .each(function() {
        creators.push(
          $(this)
            .text()
            .trim()
        );
      });
    item[creatorLabel(category)] = creators;

    if (filter === 'done') {
      item.rating = parseInt(
        $(this)
          .find('.elco-collection-rating.user > a > div > span')
          .text()
      );
    }

    items.push(item);
  });

  return items;
}

async function extract(username, category, filter, query) {
  let collection = [];
  const url = `https://www.senscritique.com/${username}/collection/${filter}/${category}/all/all/all/all/all/all/all/page-`;
  let response;

  // Crawl the first page
  try {
    response = await got(url + '1', { timeout: 20000, followRedirect: false });
  } catch (err) {
    err.message += ' (SensCritique is might be unavailable)';
    throw err;
  }

  // S'il y a une redirection vers la page d'accueil de SC, c'est que l'utilisateur n'existe pas
  if (response.statusCode === 301) {
    throw createError(
      400,
      'unknown_user',
      "This SensCritique user doesn't exist."
    );
  }

  // Then extract data from the first page
  collection.push(...extractItems(response.body, category, filter));

  // 18 being the number of item per page
  const nbOfPages = Math.ceil(collectionSize(response.body, filter) / 18);

  if (nbOfPages > 1) {
    // Build a [] from 2 => nbOfPages
    const indexes = Array.from({ length: nbOfPages }, (v, k) => k + 2);

    const handleResponse = async index => {
      response = await got(url + index, { timeout: 20000 });
      const items = extractItems(response.body, category, filter);
      collection.push(...items);
    };

    const actions = indexes.map(handleResponse);

    await Promise.all(actions);
  }

  if (
    query.watchedDate === 'true' &&
    category === 'films' &&
    filter === 'done'
  ) {
    collection = extractWatchedDate(collection, username, category);
  }

  return collection;
}

async function extractWatchedDate(collection, username, category) {
  const urlWatched = `https://www.senscritique.com/${username}/journal/${category}/all/all/page-`;
  let response;
  let page = 1;

  // Crawl pages
  do {
    try {
      response = await got(urlWatched + page + '.ajax', { timeout: 20000 });
    } catch (err) {
      err.message += ' (SensCritique is might be unavailable)';
      throw err;
    }

    // S'il y a une redirection vers la page d'accueil de SC, c'est que l'utilisateur n'existe pas
    if (response.statusCode === 301) {
      throw createError(
        400,
        'unknown_user',
        "This SensCritique user doesn't exist."
      );
    }

    const $ = cheerio.load(response.body);

    if ($('.eldi-list-item').length === 0) {
      break;
    }

    // Then extract data from the first page
    collection = insertWatchedDateIntoCollection(response.body, collection);

    page++;

    await sleep(100);
  } while (true); // eslint-disable-line

  return collection;
}

function insertWatchedDateIntoCollection(html, collection) {
  const $ = cheerio.load(html);

  $('.eldi-list-item').each(function() {
    const watchedDate = $(this).attr('data-sc-datedone');

    $(this)
      .find('.eldi-collection-container')
      .each(function() {
        const id = parseInt(
          $(this)
            .find('.eldi-collection-poster')
            .attr('data-sc-product-id')
        );

        if (watchedDate !== undefined) {
          collection.forEach((element, index) => {
            if (element.id === id) {
              collection[index].watchedDate = watchedDate;
            }
          });
        }
      });
  });

  return collection;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const json2csv = require('json2csv');

function toCSV(data, filter) {
  let fields = [];

  data = JSON.parse(
    JSON.stringify(data)
      .split('"originalTitle":')
      .join('"Title":')
      .split('"year":')
      .join('"Year":')
      .split('"directors":')
      .join('"Directors":')
      .split('"rating":')
      .join('"Rating10":')
  );

  for (let i = 0; i < data.length; i++) {
    data[i].Directors = data[i].Directors.join(', ');

    delete data[i].frenchTitle;

    if (filter === 'wish') {
      delete data[i].Rating10;
    }
  }

  if (filter === 'done') {
    fields = ['Title', 'Year', 'Directors', 'Rating10'];
  } else if (filter === 'wish') {
    fields = ['Title', 'Year', 'Directors'];
  }

  return json2csv.parse(data, { fields });
}

module.exports = {
  extract,
  toCSV
};
