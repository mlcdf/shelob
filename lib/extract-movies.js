const bluebird = require('bluebird');
const cheerio = require('cheerio');
const got = require('got');

module.exports = async function(username) {
  let stats = {};
  let movies = [];
  let pages = 1;

  const url = `https://www.senscritique.com/${username}/collection/rating/films/page-1`;
  const response = await got(url);

  const $ = cheerio.load(response.body);
  pages = $('.eipa-page:last-child a').text().replace(/^\D+/g, '');

  stats = {
    watchlist: $('[data-sc-collection-filter="wish"] span span')
      .text()
      .trim()
      .slice(1, -1),
    rated: $('[data-sc-collection-filter="rating"] span span')
      .text()
      .trim()
      .slice(1, -1),
    viewed: $('[data-sc-collection-filter="done"] span span')
      .text()
      .trim()
      .slice(1, -1)
  };

  indexes = Array.from(
    {
      length: pages
    },
    (v, k) => k + 1
  );

  count = 1;

  return await bluebird
    .map(indexes, async function(index, callback) {
      const url =
        `https://www.senscritique.com/${username}/collection/rating/films/index-` +
        index;
      const response = await got(url);

      const $ = cheerio.load(response.body);
      $('.elco-collection-item').each(function() {
        const french_title = $(this).find('.elco-title a').text().trim();

        const original_title =
          $(this).find('.elco-original-title').text().trim() !== ''
            ? $(this).find('.elco-original-title').text().trim()
            : french_title;

        const year = parseInt(
          $(this).find('.elco-date').text().trim().slice(1, -1)
        );

        const director = $(this)
          .find('.elco-product-detail a.elco-baseline-a')
          .text()
          .trim();

        const rating = $(this)
          .find('.elco-collection-rating.user > a > div > span')
          .text()
          .trim();
        movies.push({ french_title, original_title, year, director, rating });
      });
    })
    .then(() => {
      return { stats, movies };
    });
};
