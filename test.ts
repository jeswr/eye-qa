import { n3reasoner } from 'eyereasoner';
import { Store, Parser } from 'n3';
import { write } from '@jeswr/pretty-turtle';
import {} from "@rdfjs/types"
import { shapeMatches } from './lib/shapeFromDataset';
import { removeSlashes } from 'slashes';
import { FetchExectionShapeShapeType } from './ldo/executions.shapeTypes';
import quads from './lib/rules';



const hadnlers: [] = []

const q = `
@prefix log: <http://www.w3.org/2000/10/swap/log#>.
@prefix : <#>.

{
    <http://example.org/my/source> log:ctn ?Y.
} log:query {
    :result :is ?Y .
}.
`

interface Handler<T> {
    call: (data: T) => void;
}

async function main() {
    const r = await n3reasoner([...quads], q, {
        cb: async (quads) => {
            // console.log(quads.replace('\\n', ' '))
            const store = new Store(new Parser().parse(removeSlashes(quads).slice(1, -1)));
            for (const m of shapeMatches(FetchExectionShapeShapeType, store)) {
                return `<${m.source['@id']}> <http://example.org/contains> << <http://example.org/ns/2#c> <http://example.org/ns/2#c> <http://example.org/ns/2#c> >> .`
                // console.log(m.source);
            }
            // console.log(await write([...store]));
            // return '{ <http://example.org/my/source> <http://example.org/contains> << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c> >>, << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c2> >> . }';
            // Below working
            // return '{ <http://example.org/my/source> <http://example.org/contains> << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c2> >> . }';
            // This is not working
            // return `{
            //     <http://example.org/my/source> <http://example.org/contains> 1 .
            //     <http://example.org/my/source> <http://example.org/contains> 2 .
            // }`;
            return '<http://example.org/ns#a> <http://example.org/contains> <http://example.org/ns/2#c> .'
        },
        // output: 'deductive_closure'
    });
    console.log(r);
}

main();

// console.log(...quads);
