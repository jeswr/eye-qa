/* eslint-disable no-console, no-await-in-loop */
import dereferenceToStore from 'rdf-dereference-store';
import path from 'path';
import { isomorphic } from 'rdf-isomorphic';
import { write } from '@jeswr/pretty-turtle';
import { reason } from '../lib';

globalThis.fetch = async () => new Response(
  '@prefix cert: <http://www.w3.org/ns/auth/cert#> .\n  <> cert:key "key-1"; <http://example.org/b> <http://example.org/c> .',
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
  for (const [query, resultPath] of [['query.n3', 'result.n3'], ['queryKey.n3', 'resultKey.n3']]) {
    const { store } = await dereferenceToStore(path.join(__dirname, query), { localFiles: true });
    const { store: resultStore } = await dereferenceToStore(
      path.join(__dirname, resultPath),
      { localFiles: true },
    );
    const result = await reason(store);

    if (!isomorphic(result, [...resultStore])) {
      console.error(await write(result, { prefixes }), await write([...resultStore], { prefixes }));
      console.error(`Failed on ${query}`);
      process.exit(1);
    }
  }
}

main();
