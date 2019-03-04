import test from 'ava';
import app from './server';
import request from 'supertest';

test('mlcdf/films/done', async t => {
  const res = await request(app).get('/mlcdf/films/done');

  t.is(res.status, 200);

  t.true(res.body.length > 0);
  t.true(res.body.length > 700); // sanity check
  t.true(res.body.length < 1000); // sanity check

  t.true('directors' in res.body[0]);

  t.false('watchedDate' in res.body[0]);
});

test('mlcdf/films/wish', async t => {
  const res = await request(app).get('/mlcdf/films/wish');

  t.is(res.status, 200);

  t.true(res.body.length > 0);
  t.true(res.body.length > 200); // sanity check
  t.true(res.body.length < 1000); // sanity check

  t.true('directors' in res.body[0]);
});

test('mlcdf/films/done?watchedDate=True', async t => {
  const res = await request(app)
    .get('/mlcdf/films/done')
    .query({ watchedDate: true });

  t.is(res.status, 200);

  t.true(res.body.length > 0);
  t.true(res.body.length > 700); // sanity check
  t.true(res.body.length < 1000); // sanity check

  t.true('directors' in res.body[0]);
  t.true('watchedDate' in res.body[0]);
});

test('mlcdf/livres/done', async t => {
  const res = await request(app).get('/mlcdf/livres/done');

  t.true(res.body.length > 0);
  t.true('creators' in res.body[0]);
});

test('mlcdf/livres/wish', async t => {
  const res = await request(app).get('/mlcdf/livres/wish');

  t.true(res.body.length > 0);
  t.true('creators' in res.body[0]);
});

test('mlcdf/morceaux/done', async t => {
  const res = await request(app).get('/mlcdf/morceaux/done');

  t.true(res.body.length > 0);
  t.false('originalTitle' in res.body[0]);
});

test('mlcdf/morceaux/wish', async t => {
  const res = await request(app).get('/mlcdf/morceaux/wish');

  t.true(res.body.length === 0);
});

test('mlcdf/albums/done', async t => {
  const res = await request(app).get('/mlcdf/albums/done');
  t.true(res.body.length > 0);
  t.false('originalTitle' in res.body[0]);
});

test('mlcdf/albums/wish', async t => {
  const res = await request(app).get('/mlcdf/albums/wish');
  t.true(res.body.length > 0);
  t.false('originalTitle' in res.body[0]);
});

test('mlcdf/bd/done', async t => {
  const res = await request(app).get('/mlcdf/bd/done');
  t.true(res.body.length > 0);
  t.true('illustrators' in res.body[0]);
});

test('mlcdf/bd/wish', async t => {
  const res = await request(app).get('/mlcdf/bd/wish');
  t.true(res.body.length > 0);
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
