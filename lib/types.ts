import { LdoBase, ShapeType } from '@ldo/ldo';
import { DatasetCore } from '@rdfjs/types';

export interface Handler<T extends LdoBase> {
    shape: ShapeType<T>
    // eslint-disable-next-line no-unused-vars
    handler: (data: T) => Promise<DatasetCore>;
}
