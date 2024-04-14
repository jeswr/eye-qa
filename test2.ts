import { n3reasoner } from 'eyereasoner';
import { Store, Parser } from 'n3';
import { shapeMatches } from './lib/shapeFromDataset';
import { FetchExectionShapeShapeType } from './ldo/executions.shapeTypes';
import quads from './lib/rules';



const hadnlers: [] = []

const q = `
@prefix log: <http://www.w3.org/2000/10/swap/log#>.
@prefix string: <http://www.w3.org/2000/10/swap/string#>.
@prefix : <#>.

{
    ?s log:graphAsk ?o .
} <= {
    (?s) string:concatenation ?c .
    ?c log:ask ?res .
    ?res log:parsedAsN3 ?o .
} .

{
    :p :o ?ol .
} <= {
    {} log:graphAsk ?ol .
} .

{
    :p :o ?o .
} log:query {
    :result :is ?o .
}.
`

async function main() {
    const r = await n3reasoner([], q, {
        cb: async (quads) => {
            const store = new Store(new Parser().parse(quads.slice(1, -1)));
            console.log('callback called');
            // for (const m of shapeMatches(FetchExectionShapeShapeType, store)) {
            //     console.log(m.source);
            // }
            // return '{ <http://example.org/my/source> <http://example.org/contains> << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c> >>, << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c2> >> . }';
            // Below working
            return '{ <http://example.org/my/source> <http://example.org/contains> << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c2> >> . }';
            // This is not working
            // return `{
            //     <http://example.org/my/source> <http://example.org/contains> 1 .
            //     <http://example.org/my/source> <http://example.org/contains> 2 .
            // }`;
        }
    });
    console.log(r);
}

main();

// console.log(...quads);
