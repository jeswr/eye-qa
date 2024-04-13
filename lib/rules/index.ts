import { Parser, Store } from 'n3';
import rules from './rules';

export default new Store(new Parser({ format: 'text/n3' }).parse(rules));
