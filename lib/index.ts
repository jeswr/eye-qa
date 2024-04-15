import { write } from '@jeswr/pretty-turtle';
import { Quad } from '@rdfjs/types';
import { n3reasoner } from 'eyereasoner';
import { DataFactory, Store } from 'n3';
import { hashDataGraph, signParams, importKey } from '@jeswr/rdfjs-sign';
import { subtle } from 'crypto';
import { RDFCHashExectionShapeShapeType, SignatureValidationExectionShapeShapeType } from './ldo/executions.shapeTypes';
import { DatasetHandler } from './DatasetHandler';
import { fetchHander } from './handlers';
import quads from './rules';
import { SignatureValidationExectionShape } from './ldo/executions.typings';

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
    const quadsToSign = [...dataset!.match(null, null, null, objectGraph)].map(
      ({ subject, predicate, object }) => quad(subject, predicate, object),
    );
    return new Store([
      quad(namedNode('http://www.w3.org/2000/10/swap/log#result'), namedNode('http://www.w3.org/2000/10/swap/log#is'), literal(
        Buffer.from(await hashDataGraph(quadsToSign)).toString('utf8'),
      )),
    ]);
  });
  handler.register(
    SignatureValidationExectionShapeShapeType,
    async (shape: SignatureValidationExectionShape) => {
      const verify = await subtle.verify(
        signParams,
        await importKey(shape.key),
        Buffer.from(shape.signature, 'base64'),
        Buffer.from(shape.hash, 'utf8'),
      ).catch(() => false);
      return new Store(verify ? [
        quad(namedNode('http://www.w3.org/2000/10/swap/log#result'), namedNode('http://www.w3.org/2000/10/swap/log#is'), literal('true', namedNode('http://www.w3.org/2001/XMLSchema#boolean'))),
      ] : []);
    },
  );

  // For some reason that I dont want to debug right now the
  // n3reasoner serialiser isn't resulting in what we want
  const queryString = await write([...quads, ...query], { format: 'text/n3', isImpliedBy: true });
  return n3reasoner(queryString, undefined, {
    cb: (cbQuads) => handler.handleCallback(cbQuads),
    output: 'deductive_closure',
    outputType: 'quads',
  });
}
