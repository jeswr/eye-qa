import dereferenceToStore from 'rdf-dereference-store';
import path from 'path';
import 'jest-rdf';
import { reason } from '../lib';

globalThis.fetch = async () => {
  console.log('fetch called');
  return new Response('@prefix cert: <http://www.w3.org/ns/auth/cert#> .\n  <> cert:key "key1"; <http://example.org/b> <http://example.org/c> .', {
    status: 200,
    headers: new Headers([['Content-Type', 'text/turtle']]),
  });
};

it('should run', async () => {
  expect(
    reason((await dereferenceToStore(path.join(__dirname, 'query.n3'), { localFiles: true })).store),
  ).resolves.toBeRdfIsomorphic(
    (await dereferenceToStore(path.join(__dirname, 'result.n3'), { localFiles: true })).store,
  );
});

it('should run key query', async () => {
  expect(
    reason((await dereferenceToStore(path.join(__dirname, 'queryKey.n3'), { localFiles: true })).store),
  ).resolves.toBeRdfIsomorphic(
    (await dereferenceToStore(path.join(__dirname, 'result.n3'), { localFiles: true })).store,
  );
});
