import { write } from '@jeswr/pretty-turtle';
import { LdoBase, ShapeType } from '@ldo/ldo';
import { DatasetCore } from '@rdfjs/types';
import { Parser, Store } from 'n3';
import { removeSlashes } from 'slashes';
import { datasetFromShape, shapeMatches } from './shapeFromDataset';

// TODO: Add validation for each fno:executes hasValue=ex:fetch
export class DatasetHandler {
  // TODO: REMOVE THESE ANYS
  private handlers: Record<string, {
    shape: ShapeType<any>,
    // eslint-disable-next-line no-unused-vars
    handler: (data: any) => Promise<DatasetCore>
  }> = {};

  // eslint-disable-next-line no-unused-vars
  register<T extends LdoBase>(shape: ShapeType<T>, handler: (data: T) => Promise<DatasetCore>) {
    if (shape.shape in this.handlers) {
      throw new Error('Shape already registered');
    }
    this.handlers[shape.shape] = { shape, handler };
  }

  registerShaped<T extends LdoBase, K extends LdoBase>(
    shape: ShapeType<T>,
    outShape: ShapeType<K>,
    // eslint-disable-next-line no-unused-vars
    handler: (data: T) => Promise<K>,
  ) {
    if (shape.shape in this.handlers) {
      throw new Error('Shape already registered');
    }
    this.handlers[shape.shape] = {
      shape,
      handler: async (data) => datasetFromShape(outShape, await handler(data)),
    };
  }

  async handleDataset(store: DatasetCore): Promise<DatasetCore> {
    for (const { shape, handler } of Object.values(this.handlers)) {
      // eslint-disable-next-line no-unreachable-loop
      for (const match of shapeMatches(shape, store)) {
        return handler(match);
      }
    }
    throw new Error('No handler found');
  }

  async handleCallback(quads: string): Promise<string> {
    const store = new Store(new Parser().parse(removeSlashes(quads).slice(1, -1)));
    return `{\n${await write([...await this.handleDataset(store)], { format: 'text/n3' })}\n}`;
  }
}
