import { LdoBase, ShapeType } from '@ldo/ldo';
import { DatasetCore } from "@rdfjs/types";

export interface Handler<T extends LdoBase> {
    shape: ShapeType<T>
    handler: (data: T) => Promise<DatasetCore>;
}
