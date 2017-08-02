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
  username: "mlcdf",
  category: "films",
  stats: {
    watchlisted: 0,
    rated: 0,
    finished: 0
  },
  collection: [
    {
      frenchTitle: "La vie est belle",
      originalTitle: "It's a Wonderful Life",
      year: 1946,
      director: "Frank Capra",
      rating: "10"
    },
    {
      frenchTitle: "Le Lauréat",
      originalTitle: "The Graduate",
      year: 1967,
      director: "Mike Nichols",
      rating: "10"
    },
    ...
  ]
}
```

## Dev

Clone the repository
```console
git clone https://github.com/shelob.git
cd shelob
```

Install the dependencies
```console
yarn install # `npm install` works fine too
```

Launch the server
```console
npm start
```

Now, open your browser at `localhost:3000/?username=foo` (and replace `foo` by any username).

## License

This project is licensed under the MIT License.