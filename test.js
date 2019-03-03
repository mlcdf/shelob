import test from 'ava';
import { extract } from './lib';

test('mlcdf/films/done', async t => {
  const collection = await extract('mlcdf', 'films', 'done', {});
  t.true(collection.length > 0);
  t.true(collection.length > 700); // sanity check
  t.true(collection.length < 1000); // sanity check

  t.true('directors' in collection[0]);
});

test('mlcdf/films/wish', async t => {
  const collection = await extract('mlcdf', 'films', 'wish', {});
  t.true(collection.length > 0);
  t.true(collection.length > 200); // sanity check
  t.true(collection.length < 1000); // sanity check

  t.true('directors' in collection[0]);
});

test('mlcdf/films/done?watchedDate=True', async t => {
  const collection = await extract('mlcdf', 'films', 'done', {
    watchedDate: 'true'
  });
  t.true(collection.length > 0);
  t.true(collection.length > 700); // sanity check
  t.true(collection.length < 1000); // sanity check

  t.true('directors' in collection[0]);
  t.true('watchedDate' in collection[0]);
});

test('mlcdf/livres/done', async t => {
  const collection = await extract('mlcdf', 'livres', 'done', {});
  t.true(collection.length > 0);

  t.true('creators' in collection[0]);
});

test('mlcdf/livres/wish', async t => {
  const collection = await extract('mlcdf', 'livres', 'wish', {});
  t.true(collection.length > 0);

  t.true('creators' in collection[0]);
});

test('mlcdf/morceaux/done', async t => {
  const collection = await extract('mlcdf', 'morceaux', 'done', {});
  t.true(collection.length > 0);

  t.false('originalTitle' in collection[0]);
});

test('mlcdf/morceaux/wish', async t => {
  const collection = await extract('mlcdf', 'morceaux', 'wish', {});
  t.true(collection.length === 0);
});

test('mlcdf/albums/done', async t => {
  const collection = await extract('mlcdf', 'albums', 'done', {});
  t.true(collection.length > 0);
  t.false('originalTitle' in collection[0]);
});

test('mlcdf/albums/wish', async t => {
  const collection = await extract('mlcdf', 'albums', 'wish', {});
  t.true(collection.length > 0);
  t.false('originalTitle' in collection[0]);
});

test('mlcdf/bd/done', async t => {
  const collection = await extract('mlcdf', 'bd', 'done', {});
  t.true(collection.length > 0);
  t.true('illustrators' in collection[0]);
});

test('mlcdf/bd/wish', async t => {
  const collection = await extract('mlcdf', 'bd', 'wish', {});
  t.true(collection.length > 0);
  t.true('illustrators' in collection[0]);
});

test('tlkjsqfijek/films/wish', async t => {
  await t.throwsAsync(
    async () => {
      await extract('tlkjsqfijekazeze', 'films', 'done');
    },
    { instanceOf: Error, message: "This SensCritique user doesn't exist." }
  );
});
