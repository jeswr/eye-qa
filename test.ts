import { n3reasoner } from 'eyereasoner';
import { Store, Parser, DataFactory } from 'n3';
import { write } from '@jeswr/pretty-turtle';
import { DatasetCore } from "@rdfjs/types"
import { datasetFromShape, shapeMatches } from './lib/shapeFromDataset';
import { removeSlashes } from 'slashes';
import { FetchExectionShapeShapeType } from './ldo/executions.shapeTypes';
import quads from './lib/rules';
import ruleString from './lib/rules/rules';
import { ShapeType, LdoBase } from '@ldo/ldo';
import dereference from 'rdf-dereference-store';
import { FetchExectionShape } from './ldo/executions.typings';
const { namedNode, literal, defaultGraph, quad } = DataFactory;

const q = `
@prefix log: <http://www.w3.org/2000/10/swap/log#>.
@prefix ex: <http://example.org/> .

{
    <https://jeswr.org/#me> log:ctn ?Y.
} log:query {
    ex:result ex:is ?Y .
}.
`



interface Handler<T extends LdoBase> {
    shape: ShapeType<T>
    handler: (data: T) => Promise<DatasetCore>;
}

type AnyHandler = { shape: ShapeType<any>, handler: (data: any) => DatasetCore }

const handler = new DatasetHandler();

handler.register(FetchExectionShapeShapeType, async (data) => {
    const { store } = await dereference(data.source['@id']);
    const out = new Store();
    for (const quadTerm of store) {
        out.addQuad(quad(namedNode(data.source['@id']), namedNode('http://example.org/contains'), quadTerm));
    }
    return out;
});

async function main() {
    // For some reason that I dont want to debug right now the n3reasoner serialiser isn't resulting in what we want
    const r = await n3reasoner(await write([...quads, ...new Parser({ format: 'text/n3' }).parse(q)], { format: 'text/n3' }), undefined, {
        cb: (quads) => handler.handleCallback(quads),
        output: 'deductive_closure',
        outputType: 'quads'
    });
    console.log(r);
}

main();
