const movie = {
  frenchTitle: '',
  originalTitle: '',
  year: 0,
  director: '',
  rating: 0
};

const tvShow = {
  frenchTitle: '',
  originalTitle: '',
  year: 0,
  creator: '',
  rating: 0
};

const book = {
  frenchTitle: '',
  originalTitle: '',
  year: 0,
  writer: '',
  rating: 0
};

const comic = {
  frenchTitle: '',
  originalTitle: '',
  year: 0,
  author: '',
  rating: 0
};

const album = {
  originalTitle: '',
  year: 0,
  artist: '',
  rating: 0
};

const song = {
  originalTitle: '',
  year: 0,
  artist: '',
  rating: 0
};

const videoGame = {
  frenchTitle: '',
  originalTitle: '',
  year: 0,
  studio: '',
  rating: 0
};

const categoryToModels = {
  films: 'movie',
  series: 'tvShow',
  jeuxvideo: 'videoGame',
  livres: 'book',
  bd: 'comic',
  albums: 'album',
  morceaux: 'song'
};

module.exports = {
  movie,
  tvShow,
  book,
  comic,
  album,
  song,
  videoGame,
  categoryToModels
};
