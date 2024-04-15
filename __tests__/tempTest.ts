/* eslint-disable no-console, no-await-in-loop */
import dereferenceToStore from 'rdf-dereference-store';
import path from 'path';
import { isomorphic } from 'rdf-isomorphic';
import { write } from '@jeswr/pretty-turtle';
import { reason } from '../lib';

globalThis.fetch = async () => new Response(
  '@prefix cert: <http://www.w3.org/ns/auth/cert#> .\n  <> cert:key "BGxATV0qAzWy4YDIqGIKbKYBbSn44eIVWzoXS6etwi995r+AeHkiT9/qqju9mAgg+BXdSqvYNuTgcNnUbBIKVXpqJPw5xtB5AknIsRV1sNU01+u1ZGGRyiNdy+Bok0jhGQ=="; <http://example.org/b> <http://example.org/c> .',
  {
    status: 200,
    headers: new Headers([['Content-Type', 'text/turtle']]),
  },
);

const prefixes = {
  cert: 'http://www.w3.org/ns/auth/cert#',
  ex: 'http://example.org/',
};

async function main() {
  for (const [query, resultPath] of [
    ['query.n3', 'result.n3'],
    ['queryKey.n3', 'resultKey.n3'],
    ['queryHash.n3', 'resultHash.n3'],
    ['querySignature.n3', 'resultSignature.n3'],
  ]) {
    const { store } = await dereferenceToStore(path.join(__dirname, query), { localFiles: true });
    const { store: resultStore } = await dereferenceToStore(
      path.join(__dirname, resultPath),
      { localFiles: true },
    );
    const result = await reason(store);

    if (!isomorphic(result, [...resultStore])) {
      console.error('=================', 'EXPECTED', '=================');
      console.error(await write([...resultStore], { prefixes, format: 'text/n3' }));
      console.error('=================', 'RECIEVED', '=================');
      console.error(await write(result, { prefixes, format: 'text/n3' }));
      console.error(`Failed on ${query}`);
      process.exit(1);
    }
  }
}

main();
