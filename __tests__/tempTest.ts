/* eslint-disable no-console, no-await-in-loop */
import dereferenceToStore from 'rdf-dereference-store';
import * as fs from 'fs';
import path from 'path';
import { isomorphic } from 'rdf-isomorphic';
import { write } from '@jeswr/pretty-turtle';
import { Store } from 'n3';
import { reason } from '../lib';

globalThis.fetch = async () => new Response(
  '@prefix cert: <http://www.w3.org/ns/auth/cert#> .\n  <> cert:key "BGxATV0qAzWy4YDIqGIKbKYBbSn44eIVWzoXS6etwi995r+AeHkiT9/qqju9mAgg+BXdSqvYNuTgcNnUbBIKVXpqJPw5xtB5AknIsRV1sNU01+u1ZGGRyiNdy+Bok0jhGQ=="; <http://example.org/b> <http://example.org/c> .',
  {
    status: 200,
    headers: new Headers([['Content-Type', 'text/turtle']]),
  },
);

async function main() {
  for (const query of fs.readdirSync(path.join(__dirname, 'queries'))) {
    console.log(`Running ${query}`);
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
        console.error(`Failed on ${query}`);
        console.error('=================', 'EXPECTED', '=================');
        console.error(await write([...resultStore], { prefixes, format: 'text/n3' }));
        console.error('=================', 'RECIEVED', '=================');
        console.error(await write(result, { prefixes, format: 'text/n3' }));
        process.exit(1);
      }
    }
  }
}

main();
