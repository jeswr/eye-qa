import { write } from '@jeswr/pretty-turtle';
import { Quad } from '@rdfjs/types';
import { n3reasoner } from 'eyereasoner';
import { DataFactory, Store } from 'n3';
import { hashDataGraph } from '@jeswr/rdfjs-sign';
import { RDFCHashExectionShapeShapeType, SignatureValidationExectionShapeShapeType } from './ldo/executions.shapeTypes';
import { DatasetHandler } from './DatasetHandler';
import { fetchHander } from './handlers';
import quads from './rules';

const {
  quad, namedNode, defaultGraph, literal,
} = DataFactory;

export async function reason(query: Iterable<Quad>) {
  const handler = new DatasetHandler();
  handler.register(fetchHander.shape, fetchHander.handler);
  handler.register(RDFCHashExectionShapeShapeType, async (_, dataset) => {
    if (!dataset) {
      throw new Error('No dataset provided');
    }
    const [{ object: objectGraph }] = dataset.match(null, namedNode('http://example.org/contents'), null, defaultGraph());
    function* yieldQuads() {
      for (const { subject, predicate, object } of dataset!.match(null, null, null, objectGraph)) {
        yield quad(subject, predicate, object);
      }
    }
    return new Store([
      quad(namedNode('http://www.w3.org/2000/10/swap/log#result'), namedNode('http://www.w3.org/2000/10/swap/log#is'), literal(
        Buffer.from(await hashDataGraph(yieldQuads())).toString('utf8'),
      )),
    ]);
  });
  handler.register(SignatureValidationExectionShapeShapeType, async (shape, dataset) => {
    if (!dataset) {
      throw new Error('No dataset provided');
    }
    console.log('SignatureValidationExectionShapeShapeType', shape, dataset);
    return new Store([
      quad(namedNode('http://www.w3.org/2000/10/swap/log#result'), namedNode('http://www.w3.org/2000/10/swap/log#is'), literal('true', namedNode('http://www.w3.org/2001/XMLSchema#boolean'))),
    ]);
  });

  // For some reason that I dont want to debug right now the
  // n3reasoner serialiser isn't resulting in what we want
  return n3reasoner(await write([...quads, ...query], { format: 'text/n3', isImpliedBy: true }), undefined, {
    cb: (cbQuads) => handler.handleCallback(cbQuads),
    output: 'deductive_closure',
    outputType: 'quads',
  });
}
