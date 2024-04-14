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
@prefix : <#>.

{
    <https://jeswr.org/#me> log:ctn ?Y.
} log:query {
    :result :is ?Y .
}.
`



interface Handler<T extends LdoBase> {
    shape: ShapeType<T>
    handler: (data: T) => Promise<DatasetCore>;
}

type AnyHandler = { shape: ShapeType<any>, handler: (data: any) => DatasetCore }

// TODO: Add validation for each fno:executes hasValue=ex:fetch
class DatasetHandler {
    // TODO: REMOVE THESE ANYS
    private handlers: Record<string, { shape: ShapeType<any>, handler: (data: any) => Promise<DatasetCore> }> = {};
    
    register<T extends LdoBase>(shape: ShapeType<T>, handler: (data: T) => Promise<DatasetCore>) {
        if (shape.shape in this.handlers) {
            throw new Error('Shape already registered');
        }
        this.handlers[shape.shape] = { shape, handler };
    }

    registerShaped<T extends LdoBase, K extends LdoBase>(shape: ShapeType<T>, outShape: ShapeType<K>, handler: (data: T) => Promise<K>) {
        if (shape.shape in this.handlers) {
            throw new Error('Shape already registered');
        }
        this.handlers[shape.shape] = { shape, handler: async (data) => datasetFromShape(outShape, await handler(data)) };
    }

    handleDataset(store: DatasetCore): Promise<DatasetCore> {
        for (const { shape, handler } of Object.values(this.handlers)) {
            for (const match of shapeMatches(shape, store)) {
                return handler(match);
            }
        }
        throw new Error('No handler found');
    }

    async handleCallback(quads: string): Promise<string> {
        const store = new Store(new Parser().parse(removeSlashes(quads).slice(1, -1)));
        return '{\n' + await write([...await this.handleDataset(store)], { format: 'text/n3' }) + '\n}';
    }
}


const handler = new DatasetHandler();

handler.register(FetchExectionShapeShapeType, async (data) => {
    const { store } = await dereference(data.source['@id']);
    const out = new Store();
    // let i = 0;
    for (const quadTerm of store) {
        out.addQuad(quad(namedNode(data.source['@id']), namedNode('http://example.org/contains'), quadTerm));
        // out.addQuad(quad(namedNode(data.source['@id']), namedNode('http://example.org/contains'), literal(i++)));
        break;
    }
    return out;
});

async function main() {
    const r = await n3reasoner([...quads, ...new Parser({ format: 'text/n3' }).parse(q)], undefined, {
        cb: (quads) => handler.handleCallback(quads),
        output: 'deductive_closure'
    });
    console.log(r);
}

main();
