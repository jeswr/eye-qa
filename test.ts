import { n3reasoner } from 'eyereasoner';
import quads from './lib/rules';

const q = `
@prefix log: <http://www.w3.org/2000/10/swap/log#>.
@prefix : <#>.

{
    { <http://example.org/> <http://example.org/> <http://example.org/> . } log:graphAsk ?Y.
} log:query {
    :result :is ?Y .
}.
`

async function main() {
    n3reasoner([...quads], q, {
        cb: async (quads) => {
            console.log(quads);
            return quads;
        }
    });
}

main();

// console.log(...quads);
