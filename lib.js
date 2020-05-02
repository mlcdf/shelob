const url = require("url");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const https = require("https");

const cheerio = require("cheerio");

// Construit une URL à partir de l'url de la première page et d'un numéro de page
function makeUrl(baseUrl, pageNumber) {
  if (baseUrl.includes("page-")) {
    if (baseUrl.match(/\/$/)) {
      baseUrl = baseUrl.slice(0, -1)
    }
    let splitUrl = baseUrl.split("/");
    splitUrl.pop();
    splitUrl.push("page-" + pageNumber);
    return splitUrl.join("/");
  } else {
    console.log("fuck")
    if (!baseUrl.match(/\/$/)) {
      baseUrl += "/";
    }
    return url.resolve(baseUrl, "page-" + pageNumber);
  }
}

/**
 * Est ce que c'est un film, une série, un livre, etc...
 * @param item {Object} is a cheerio object
 */
function guessItemCategory($item) {
  const url = $item
    .find(
      ".elco-collection-content > .elco-product-detail > .elco-title > a, .elli-content > .elco-title > a"
    )
    .attr("href");

  const category = url.split("/")[1];
  if (
    !["film", "serie", "livre", "jeuvideo", "morceau", "album", "bd"].includes(
      category
    )
  ) {
    createError(
      500,
      "guess_category_failed",
      "We tried to guess the category of item x, but we failed"
    );
  }
  return category;
}

/**
 * Figure out which label to use for the field `creators`
 * @param {String} category
 */
function creatorLabel(category) {
  if (category === "film") {
    return "directors";
  }
  if (category === "bd") {
    return "illustrators";
  }
  return "creators";
}

function numberOfPages(html, filter) {
  const $ = cheerio.load(html);

  let nb = parseInt(
    $(".eipa-pages .eipa-page")
      .last()
      .find("a")
      .attr("data-sc-pager-page")
  );

  if (Object.is(nb, NaN)) {
    nb = 0;
  }

  return nb;
}

/**
 * Extract all the items (ie movies, books, ...) from a HTML page
 * @param {String} html
 */
function extractItems(html) {
  const $ = cheerio.load(html);
  const items = [];

  if ($(".elco-collection-item, .elli-item").length === 0) {
    throw new Error("Failed to extract item");
  }

  $(".elco-collection-item, .elli-item").each(function() {
    const item = Object.create({});

    const category = guessItemCategory($(this));

    item.category = category;

    item.id = parseInt(
      $(this)
        .find(".elco-collection-content > .elco-collection-poster, .elli-media figure")
        .attr("data-sc-product-id")
    );

    item.frenchTitle = $(this)
      .find(".elco-title a")
      .text()
      .trim();

    if (!["morceaux", "albums"].includes(category)) {
      const originalTitle = $(this)
        .find(".elco-original-title")
        .text()
        .trim();
      item.originalTitle =
        originalTitle !== "" ? originalTitle : item.frenchTitle;
    }

    item.year = parseInt(
      $(this)
        .find(".elco-date")
        .text()
        .trim()
        .slice(1, -1)
    );

    const creators = [];
    $(this)
      .find(".elco-product-detail a.elco-baseline-a, .elli-content a.elco-baseline-a")
      .each(function() {
        creators.push(
          $(this)
            .text()
            .trim()
        );
      });
    item[creatorLabel(category)] = creators;

    if (false) {
      item.rating = parseInt(
        $(this)
          .find(".elco-collection-rating.user > a > div > span")
          .text()
      );
    }

    items.push(item);
  });

  return items;
}

function get(url) {
  return new Promise(function(resolve, reject) {
    console.log("Requesting " + url);
    https
      .get(url, response => {
        let data = "";

        if (response.statusCode == 302 || response.statusCode == 301) {
          console.log(`Got ${response.statusCode}, following redirection to ${response.headers.location}`)
          return get(response.headers.location);
        }

        if (response.statusCode < 200 || response.statusCode > 299) {
          console.error(`Got ${response.statusCode}`)
          reject(response);
          return;
        }

        // A chunk of data has been recieved.
        response.on("data", chunk => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        response.on("end", () => {
          response.body = data;
          resolve(response);
        });
      })
      .on("error", err => {
        reject(err);
        console.log("Error: " + err.message);
      });
  });
}

function createError(code, id, message) {
  const err = new Error(message);

  err.statusCode = code;
  err.id = id;

  return err;
}

async function extract(url) {
  let collection = [];
  let response;

  // Crawl the first page
  try {
    response = await get(url, { timeout: 20000, followRedirect: false });
  } catch (err) {
    err.message += " (SensCritique is might be unavailable)";
    throw err;
  }

  // S'il y a une redirection vers la page d'accueil de SC, c'est que l'utilisateur n'existe pas
  if (response.statusCode === 301) {
    throw createError(
      400,
      "unknown_user",
      "This SensCritique user doesn't exist."
    );
  }

  // Then extract data from the first page
  collection.push(...extractItems(response.body));

  const nbOfPages = numberOfPages(response.body);
  console.log(nbOfPages);

  if (nbOfPages > 1) {
    // Build a [] from 2 => nbOfPages
    const indexes = Array.from({ length: nbOfPages - 1 }, (v, k) => k + 2);
    console.log(indexes);
    const handleResponse = async index => {
      response = await get(lib.makeUrl(url, index), { timeout: 10000 });
      const items = extractItems(response.body);
      collection.push(...items);
    };

    const actions = indexes.map(handleResponse);

    await Promise.all(actions);
  }

  return collection;
}

function sha256(txt) {
  const shasum = crypto.createHash("sha256");
  shasum.update(txt);
  return shasum.digest("hex");
}

function isCacheValid(filepath, duration) {
  return false;
  try {
    var stats = fs.statSync(filepath);
  } catch (err) {
    if (err.code === "ENOENT") {
      return false;
    }
  }

  const currentTime = new Date();
  if (currentTime.getTime() > stats.mtime.getTime() + duration) {
    return false;
  }

  return true;
}

function cache(directory, duration) {
  if (directory === undefined) {
    throw new Error("directory cannot be undefined");
  }

  return function(request, response, next) {
    const hash = sha256(JSON.stringify(request.body));
    const filepath = path.join(__dirname, directory, hash);

    if (isCacheValid(filepath, duration)) {
      var content = fs.readFileSync(filepath, "utf8");
      console.log("Serving from cache:\n" + content);
      // response.type("json");
      response.send(content);
      return;
    } else {
      response.sendResponse = response.send;
      response.send = function(body) {
        try {
          console.log("Writing to cache");
          fs.writeFileSync(filepath, JSON.stringify(body), "utf8");
          response.sendResponse(body);
        } catch (err) {
          if (err) {
            next(err);
          }
          console.log("The file was saved!");
        }
      };
      next();
    }
  };
}

module.exports = {
  makeUrl,
  cache,
  extract
};
