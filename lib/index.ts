import { write } from '@jeswr/pretty-turtle';
import { Quad } from '@rdfjs/types';
import { n3reasoner } from 'eyereasoner';
import { DataFactory, Parser } from 'n3';
import { DatasetHandler } from './DatasetHandler';
import { fetchHander } from './handlers';
import quads from './rules';

export async function reason(query: Iterable<Quad>) {
    const handler = new DatasetHandler();
    handler.register(fetchHander.shape, fetchHander.handler);

    // For some reason that I dont want to debug right now the n3reasoner serialiser isn't resulting in what we want
    return n3reasoner(await write([...quads, ...query], { format: 'text/n3' }), undefined, {
        cb: (quads) => handler.handleCallback(quads),
        output: 'deductive_closure',
        outputType: 'quads'
    });
}
