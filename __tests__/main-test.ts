import dereferenceToStore from 'rdf-dereference-store';
import path from 'path';
import 'jest-rdf';
import { reason } from '../lib';

globalThis.fetch = async () => new Response('<http://example.org/a> <http://example.org/b> 1, 2 .', {
  status: 200,
  headers: new Headers([['Content-Type', 'text/turtle']]),
});

it('should run', async () => {
  expect(
    reason((await dereferenceToStore(path.join(__dirname, 'query.n3'), { localFiles: true })).store),
  ).resolves.toBeRdfIsomorphic(
    (await dereferenceToStore(path.join(__dirname, 'result.n3'), { localFiles: true })).store,
  );
});
