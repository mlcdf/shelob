# Shelob

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> Shelob crawls https://senscritique.com and extract your data (or someone else's).

## Usage

All API access is over HTTPS, and accessed from https://shelob.glitch.me. All data is sent and received as JSON.

### Get user rating

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

By default, the ouput is pretty printed. If you want the raw ouput, without any formatting, simply add `?pretty=false` at the end of the request:

```console
curl -i 'https://shelob.glitch.me/mlcdf/films?pretty=false'
```

#### Response

**200 Success**

```javascript
{
  "username": "mlcdf",
  "category": "films",
  "stats": {
    "watchlisted": 986,
    "rated": 683,
    "finished": 689
  },
  "collection": [
    {
      "frenchTitle": "Le Seigneur des Anneaux : La Communauté de l'anneau",
      "originalTitle": "The Lord of the Rings: The Fellowship of the Ring",
      "year": 2001,
      "director": "Peter Jackson",
      "rating": 9
    },
    {
      "frenchTitle": "Le Lauréat",
      "originalTitle": "The Graduate",
      "year": 1967,
      "director": "Mike Nichols",
      "rating": 10
    },
    {
      "frenchTitle": "La Jetée",
      "originalTitle": "La Jetée",
      "year": 1962,
      "director": "Chris Marker",
      "rating": 9
    },
    // 680 films ommited
  ]
}
```

## Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.
2. Install dependencies using npm `npm install` or Yarn: `yarn install`.
3. Make the necessary changes.
4. Send a pull request.


## License

This project is licensed under the MIT License.
