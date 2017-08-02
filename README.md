# Shelob

> Shelob is an API allowing you to extract your data (or someone else's) from SensCritique.

## API

**GET**

```/:username/:category```

Example:

```console
curl -i 'https://shelob.mlcdf.com/mlcdf/films'
```

### Parameter

| Field  | Type    | Description              |
| ------ | ------- | ------------------------ |
| pretty | Boolean | Pretty print the output. |

Example:

```console
curl -i 'https://shelob.mlcdf.com/mlcdf/films?pretty=true'
```

### Response

```json
Status: 200 OK
---

{
  "username": "mlcdf",
  "category": "films",
  "stats": {
    "watchlisted": 0,
    "rated": 0,
    "finished": 0
  },
  "collection": [
    {
      "frenchTitle": "La vie est belle",
      "originalTitle": "It's a Wonderful Life",
      "year": 1946,
      "director": "Frank Capra",
      "rating": "10"
    },
    {
      "frenchTitle": "Le Lauréat",
      "originalTitle": "The Graduate",
      "year": 1967,
      "director": "Mike Nichols",
      "rating": "10"
    },
    "...": "..."
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