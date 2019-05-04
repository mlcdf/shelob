import test from 'ava';
import app from './server';
import request from 'supertest';
import { extractStats } from './lib';

test.before(async t => {
  t.context.statsDone = await extractStats('khomille', 'done');
  t.context.statsInWishlist = await extractStats('khomille', 'wish');
});

test('khomille/films/done', async t => {
  const res = await request(app).get('/khomille/films/done');

  t.is(res.status, 200);
  t.is(res.body.length, t.context.statsDone.films);
  t.true('directors' in res.body[0]);
  t.false('watchedDate' in res.body[0]);
});

test('khomille/films/wish', async t => {
  const res = await request(app).get('/khomille/films/wish');

  t.is(res.status, 200);
  t.is(res.body.length, t.context.statsInWishlist.films);
  t.true('directors' in res.body[0]);
});

test('khomille/films/done?watchedDate=True', async t => {
  const res = await request(app)
    .get('/khomille/films/done')
    .query({ watchedDate: true });

  t.is(res.status, 200);
  t.is(res.body.length, t.context.statsDone.films);
  t.true('directors' in res.body[0]);
  t.true('watchedDate' in res.body[0]);
});

test('khomille/livres/done', async t => {
  const res = await request(app).get('/khomille/livres/done');

  t.is(res.body.length + 1, t.context.statsDone.livres);
  t.true('creators' in res.body[0]);
});

test('khomille/livres/wish', async t => {
  const res = await request(app).get('/khomille/livres/wish');

  t.is(res.body.length, t.context.statsInWishlist.livres);
  t.true('creators' in res.body[0]);
});

test('khomille/morceaux/done', async t => {
  const res = await request(app).get('/khomille/morceaux/done');

  t.is(res.body.length, t.context.statsDone.morceaux);
  t.false('originalTitle' in res.body[0]);
});

test('khomille/morceaux/wish', async t => {
  const res = await request(app).get('/khomille/morceaux/wish');

  t.is(res.body.length, t.context.statsInWishlist.morceaux);
});

test('khomille/albums/done', async t => {
  const res = await request(app).get('/khomille/albums/done');
  t.is(res.body.length, t.context.statsDone.albums);
  t.false('originalTitle' in res.body[0]);
});

test('khomille/albums/wish', async t => {
  const res = await request(app).get('/khomille/albums/wish');
  t.is(res.body.length, t.context.statsInWishlist.albums);
  t.false('originalTitle' in res.body[0]);
});

test('khomille/bd/done', async t => {
  const res = await request(app).get('/khomille/bd/done');
  t.is(res.body.length, t.context.statsDone.bd + 1);
  t.true('illustrators' in res.body[0]);
});

test('khomille/bd/wish', async t => {
  const res = await request(app).get('/khomille/bd/wish');
  t.is(res.body.length, t.context.statsInWishlist.bd);
  t.true('illustrators' in res.body[0]);
});

test('tlkjsqfijek/films/done', async t => {
  const res = await request(app).get('/tlkjsqfijek/films/done');

  t.is(res.status, 400);
  t.deepEqual(res.body, {
    errors: [
      {
        id: 'unknown_user',
        message: "This SensCritique user doesn't exist."
      }
    ]
  });
});

test('foobar', async t => {
  const res = await request(app).get('/foobar');
  t.is(res.status, 404);
});

test('/', async t => {
  const res = await request(app).get('/');
  t.is(res.status, 200);
});
