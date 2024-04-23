/* eslint-disable no-console, no-await-in-loop */
import dereferenceToStore from 'rdf-dereference-store';
import * as fs from 'fs';
import path from 'path';
import { isomorphic } from 'rdf-isomorphic';
import { write } from '@jeswr/pretty-turtle';
import { Store } from 'n3';
import { reason } from '../lib';

describe('main', () => {
  beforeAll(() => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(async (url: RequestInfo | URL) => new Response(
      {
        'http://localhost:3000/': '@prefix cert: <http://www.w3.org/ns/auth/cert#> .\n  <> cert:key "BGxATV0qAzWy4YDIqGIKbKYBbSn44eIVWzoXS6etwi995r+AeHkiT9/qqju9mAgg+BXdSqvYNuTgcNnUbBIKVXpqJPw5xtB5AknIsRV1sNU01+u1ZGGRyiNdy+Bok0jhGQ=="; <http://example.org/b> <http://example.org/c> .',
        'http://localhost:3005/': '@prefix cert: <http://www.w3.org/ns/auth/cert#> .\n  <> cert:key "BJGqfJRQjD6z9meDZDuFnXMmiu7W9bz6IqKAatnEIbD3TaaNBqwnWGwmv0EbHexKJK1qZTOR/5WunBRkv1fCOR3LylH9V/cqNJ8ZoP5IxmGn9A2FGur6A8MMrPTc03LZcw=="; <http://example.org/d> 1 .',
      }[url.toString()],
      {
        status: 200,
        headers: new Headers([['Content-Type', 'text/turtle']]),
      },
    ));
  });

  it.each(fs.readdirSync(path.join(__dirname, 'queries')))('should run %s', async (query) => {
    const { store, prefixes } = await dereferenceToStore(path.join(__dirname, 'queries', query), { localFiles: true });
    const { store: resultStore } = await dereferenceToStore(
      path.join(__dirname, 'results', query),
      { localFiles: true },
    ).catch(() => ({ store: new Store() }));
    const result = await reason(store);

    if (!isomorphic(result, [...resultStore])) {
      if (process.argv.includes('-u')) {
        console.warn(`Updating ${query}`);
        fs.writeFileSync(
          path.join(__dirname, 'results', query),
          await write([...result], { prefixes, format: 'text/n3' }),
        );
      } else {
        expect(await write(result, { prefixes, format: 'text/n3' })).toEqual(await write([...resultStore], { prefixes, format: 'text/n3' }));
      }
    }
  });
});
