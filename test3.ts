import { n3reasoner } from 'eyereasoner';
import { Store, Parser } from 'n3';
import { shapeMatches } from './lib/shapeFromDataset';
import { FetchExectionShapeShapeType } from './ldo/executions.shapeTypes';
import quads from './lib/rules';
import { removeSlashes } from 'slashes';
import { write } from "@jeswr/pretty-turtle";



const hadnlers: [] = []

const q = `@prefix log: <http://www.w3.org/2000/10/swap/log#>.
@prefix string: <http://www.w3.org/2000/10/swap/string#>.
@prefix ex: <http://example.org/> .
@prefix fno: <https://w3id.org/function/ontology#> .
@prefix : <http://example.org/ns#>.

{
    ?s log:graphAsk ?o .
} <= {
    (?s) string:concatenation ?c .
    ?c log:ask ?res .
    ?res log:parsedAsN3 ?o .
} .

{
    ?s :o ?o .
} <= {
    { <urn:skolem:bf17a504-4d2d-476e-b5ef-66a5157b20a0> a fno:Execution ;fno:executes ex:fetch ;ex:source ?s . } log:graphAsk [ log:includes { ?s :b ?o } ] .
} .

{
    <http://example.org/ns#a> :o ?o .
} log:query {
    :result :is ?o .
}.

`

async function main() {



    const r = await n3reasoner(await write([...new Parser({ format: 'text/n3' }).parse(q)], {
        format: 'text/n3',
        isImpliedBy: true
    }), undefined, {
        cb: async (quads) => {
            // Note that true === {} / the emtpy graph
            // console.log(quads.slice(1, -1));
            // const store = quads === 'true' ? new Store() : new Store(new Parser().parse(removeSlashes(quads).slice(3, -3)));
            // for (const m of shapeMatches(FetchExectionShapeShapeType, store)) {
            //     console.log(m.source);
            // }
            // return '{ <http://example.org/my/source> <http://example.org/contains> << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c> >>, << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c2> >> . }';
            // Below working
            // return '{ <http://example.org/my/source> <http://example.org/contains> << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c2> >> . }';
            // return '<http://example.org/my/source> <http://example.org/contains> << <http://example.org/my/a> <http://example.org/b> <http://example.org/my/c2> >> .';
            // console.log(store)
            return '{ <http://example.org/ns#a> <http://example.org/ns#b> <http://example.org/ns/2#c>, <http://example.org/ns/2#c2> . }'
            // return "{ @prefix : <http://example.org/ns#>.\n :a :b 1, 2. }";
            // This is not working
            // return `{
            //     <http://example.org/my/source> <http://example.org/contains> 1 .
            //     <http://example.org/my/source> <http://example.org/contains> 2 .
            // }`;
        },
        output: 'deductive_closure'
    });
    console.log(r);
}

main();

// console.log(...quads);
