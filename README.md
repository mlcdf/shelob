# Shelob

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> Shelob crawls https://senscritique.com and extracts your data (or someone else's).

## Usage

All API access is over HTTPS, and accessed from https://shelob.glitch.me. All data is sent and received as JSON.

### Get user ratings by category

```
GET /:username/:category
```

Note: The field `category` must be one of the following value:
- `films`
- `series`
- `jeuxvideo`
- `albums`
- `morceaux`
- `bd`
- `livres`

Example:

```console
curl -i 'https://shelob.glitch.me/mlcdf/films'
```

By default, the output is pretty printed. If you want the raw ouput, without any formatting, simply add `?pretty=false` at the end of the request:

```console
curl -i 'https://shelob.glitch.me/mlcdf/films?pretty=false'
```

#### Response

**200 Success**

```javascript
{
  "username": "mlcdf",
  "category": "series",
  "stats": {
    "watchlisted": 260,
    "rated": 437,
    "finished": 438
  },
  "collection": [
    {
      "frenchTitle": "The Americans",
      "originalTitle": "The Americans",
      "year": 2013,
      "creators": [
        "Joseph Weisberg"
      ],
      "rating": 10
    },
    {
      "frenchTitle": "Batman, la Série Animée",
      "originalTitle": "Batman : The Animated Series",
      "year": 1992,
      "creators": [
        "Bruce Timm",
        "Eric Radomski"
      ],
      "rating": 8
    },
    {
      "frenchTitle": "The Leftovers",
      "originalTitle": "The Leftovers",
      "year": 2014,
      "creators": [
        "Damon Lindelof",
        "Tom Perrotta"
      ],
      "rating": 10
    },
    // 434 TV shows ommited
  ]
}
```

**Note**
- If you exports comics (`bd`) or movies (`films`), the field `creators` will be named respectively `illustrators` or `directors`.

## Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.
2. Install dependencies using npm `npm install` or Yarn: `yarn install`.
3. Make the necessary changes.
4. Send a pull request.


## License

This project is licensed under the MIT License.
