import { DataFactory, Store } from 'n3';
import dereference from 'rdf-dereference-store';
import { Handler } from '../types';
import { FetchExectionShapeShapeType } from '../ldo/executions.shapeTypes';
import { FetchExectionShape } from '../ldo/executions.typings';
const { namedNode, quad } = DataFactory;

export const fetchHander: Handler<FetchExectionShape> = {
    shape: FetchExectionShapeShapeType,
    handler: async (data) => {
        const { store } = await dereference(data.source['@id']);
        const out = new Store();
        for (const quadTerm of store) {
            out.addQuad(quad(namedNode(data.source['@id']), namedNode('http://example.org/contains'), quadTerm));
        }
        return out;
    }
}
