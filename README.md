# Shelob

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> Shelob crawls https://senscritique.com and extracts your data (or someone else's).

## Usage

All API access is over HTTPS, and accessed from https://shelob.glitch.me.

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

### Import movies to Letterboxd

#### Watched films

> List of all the movies you've watched exported in a CSV file

```
GET /:username/films/done?exportWebsite=letterboxd
```

Example:

Copy/Paste the following URL in your browser
```
https://shelob.glitch.me/<your_username>/films/done?exportWebsite=letterboxd
```

A file named `watched.csv` will be generated and saved in your Downloads folder.
You can then import it to Letterboxd at the following url: https://letterboxd.com/import/

#### Wishlist films

> List of all the movies you've added to your wishlist exported in a CSV file

```
GET /:username/films/wish?exportWebsite=letterboxd
```

Example:

Copy/Paste the following URL in your browser
```
https://shelob.glitch.me/<your_username>/films/wish?exportWebsite=letterboxd
```

A file named `wishlist.csv` will be generated and saved in your Downloads folder.
You can then import it to Letterboxd at the following url: https://letterboxd.com/watchlist/


## Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.
2. Install dependencies using npm `npm install` or Yarn: `yarn install`.
3. Make the necessary changes.
4. Send a pull request.

## Contributors

- [Maxime Le Conte des Floris](https://github.com/mlcdf)
- [Pierrick TURELIER](https://github.com/PierrickGT)
- [DDR](https://github.com/DDrzn)

## License

This project is licensed under the MIT License.
