# Shelob

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> Shelob crawls https://senscritique.com and extracts your data (or someone else's).

## Usage

All API access is over HTTPS, and accessed from https://shelob.glitch.me. All data is sent and received as JSON.

### Collection of a user by category

> List of works (restrained to the specified category) marked by the user as **rated or done**.

```
GET /:username/:category/done
```

- `category` must be one of the following value:
  - `films`
  - `series`
  - `jeuxvideo`
  - `albums`
  - `morceaux`
  - `bd`
  - `livres`

Example:

```console
curl -i 'https://shelob.glitch.me/mlcdf/series/done'
```

By default, the output is pretty printed. If you want the raw ouput, without any formatting, simply add `?pretty=false` at the end of the request:

```console
curl -i 'https://shelob.glitch.me/mlcdf/series/done?pretty=false'
```

#### Response

**200 Success**

```javascript
[
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
  //...
]
```

**Note**
- If you exports comics (`bd`) or movies (`films`), the field `creators` will be named respectively `illustrators` or `directors`.

### Wishlist of a user by category

> List of works (restrained to the specified category) marked by the user as **wish**.

```
GET /:username/:category/wish
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
curl -i 'https://shelob.glitch.me/mlcdf/series/wish'
```

By default, the output is pretty printed. If you want the raw ouput, without any formatting, simply add `?pretty=false` at the end of the request:

```console
curl -i 'https://shelob.glitch.me/mlcdf/series/wish?pretty=false'
```

#### Response

**200 Success**

```javascript
[
  {
    frenchTitle: "Atlanta",
    originalTitle: "Atlanta",
    year: 2016,
    creators: ["Donald Glover"]
  }
  {
    frenchTitle: "Mindhunter",
    originalTitle: "Mindhunter",
    year: 2017,
    creators: ["David Fincher"]
  },
  {
    frenchTitle: "Halt and Catch Fire",
    originalTitle: "Halt and Catch Fire",
    year: 2014,
    creators: ["Christopher Cantwell", "Christopher C. Rogers"]
  },
  //...
]
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
