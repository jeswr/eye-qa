import * as fs from 'fs';
import path from 'path';
import dereference from 'rdf-dereference-store';
import { Store, DataFactory, Quad_Predicate } from 'n3';
import { rdf } from 'rdf-namespaces';
import { write } from '@jeswr/pretty-turtle';
const { blankNode, namedNode, quad, variable } =  DataFactory;

let i = 0;

async function dereferenceFolder(folder: string) {
    const fullStore = new Store();
    let allPrefixes: Record<string, string> = {};
    for (const file of fs.readdirSync(folder, { recursive: true, withFileTypes: true })) {
        try {
            const { store, prefixes } = await dereference(path.join(file.path, file.name), { localFiles: true });
            fullStore.addQuads([...store]);
            allPrefixes = { ...allPrefixes, ...prefixes };
        } catch (e) {
            // Ignore errors as these will be the n3q files
        }
    }
    return { store: fullStore, prefixes: allPrefixes };
}

function getPrefixes(content: string) {
    const prefixes: Record<string, string> = {};
    for (const match of content.matchAll(/@prefix\s+([a-z]+)\:\s+\<([a-z0-9\:\/\.\#]+)\>\s*\./ig)) {
        prefixes[match[1]] = match[2];
    }
    return prefixes;
}

async function main() {
    const shapes = await dereferenceFolder(path.join(__dirname, '..', 'shapes'));

    // GENERATE n3 from n3q
    const folder = path.join(__dirname, '..', 'rules');
    for (const file of fs.readdirSync(folder, { recursive: true, withFileTypes: true })) {
        if (file.name.endsWith('.n3q')) {
            const filePath = path.join(file.path, file.name);
            let contents = fs.readFileSync(path.join(file.path, file.name), 'utf-8');
            const prefixes = getPrefixes(contents);
            for (const [match] of contents.matchAll(/\@[a-z]+\:[a-z]+/ig)) {
                const shape = prefixes[match.split(':')[0].slice(1)] + match.split(':')[1];
                
                const bn = blankNode();
                const replacementStore = new Store([
                    quad(bn, namedNode(rdf.type), namedNode('https://w3id.org/function/ontology#Execution')),
                ]);

                for (const property of shapes.store.getObjects(shape, 'http://www.w3.org/ns/shacl#property', null)) {
                    for (const path of shapes.store.getObjects(property, 'http://www.w3.org/ns/shacl#path', null)) {
                        const value = shapes.store.getObjects(property, 'http://www.w3.org/ns/shacl#hasValue', null);
                        replacementStore.addQuad(bn, path as Quad_Predicate, value.length === 1 ? value[0] : variable(`v${i++}`));
                    }
                }

                contents = contents.replace(match, '{\n' + await write([...replacementStore]) + '\n}');
            }
            fs.writeFileSync(filePath.replace('.n3q', '.n3'), contents);
        }
    }
    // FINISH GENERATE n3 from n3q

    // GENERATE A TYPESCRIPT CONSTANT WITH ALL n3
    const rulesQuads = await dereferenceFolder(path.join(__dirname, '..', 'rules'));

    const rules =  await write([...rulesQuads.store], {
        format: 'text/n3',
        prefixes: rulesQuads.prefixes,
        compact: true,
    })
    fs.writeFileSync(path.join(__dirname, '..', 'lib', 'rules', 'rules.ts'), `export default "${rules}"`);
    // FINISH GENERATE A TYPESCRIPT CONSTANT WITH ALL n3
}

main()
