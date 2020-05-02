const test = require("tape");

const lib = require("./lib");

test("Make url with path-1", function(t) {
  t.plan(1);

  const url = lib.makeUrl(
    "https://www.senscritique.com/mlcdf/collection/rating/all/all/all/all/all/all/all/all/page-1",
    2
  );

  t.equal(
    url,
    "https://www.senscritique.com/mlcdf/collection/rating/all/all/all/all/all/all/all/all/page-2"
  );
});

test("Make url with path-1 with trailing slash", function(t) {
  t.plan(1);

  const url = lib.makeUrl(
    "https://www.senscritique.com/mlcdf/collection/rating/all/all/all/all/all/all/all/all/page-1/",
    2
  );

  t.equal(
    url,
    "https://www.senscritique.com/mlcdf/collection/rating/all/all/all/all/all/all/all/all/page-2"
  );
});

test("Make url without path-X without trailing slash", function(t) {
  t.plan(1);

  const url = lib.makeUrl(
    "https://www.senscritique.com/liste/Top_10_Films/297529",
    4
  );

  t.equal(
    url,
    "https://www.senscritique.com/liste/Top_10_Films/297529/page-4"
  );
});

test("Make url without path-X with trailing slash", function(t) {
  t.plan(1);

  const url = lib.makeUrl(
    "https://www.senscritique.com/liste/Top_10_Films/297529/",
    4
  );

  t.equal(
    url,
    "https://www.senscritique.com/liste/Top_10_Films/297529/page-4"
  );
});
