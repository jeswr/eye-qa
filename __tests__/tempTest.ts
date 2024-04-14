import dereferenceToStore from 'rdf-dereference-store';
import path from 'path';
import { isomorphic } from 'rdf-isomorphic';
import { reason } from '../lib';

globalThis.fetch = async () => new Response('<http://example.org/a> <http://example.org/b> 1, 2 .', {
    status: 200,
    headers: new Headers([['Content-Type', 'text/turtle']])
});

async function main() {
    const { store } = await dereferenceToStore(path.join(__dirname, 'query.n3'), { localFiles: true });
    const { store: resultStore } = await dereferenceToStore(path.join(__dirname, 'result.n3'), { localFiles: true });
    const result = await reason(store);

    if (!isomorphic(result, [...resultStore])) {
        console.error('Failed');
        process.exit(1);
    }

}

main()
