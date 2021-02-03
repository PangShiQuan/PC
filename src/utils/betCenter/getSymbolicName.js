import { type } from '../';

export function getSymbolicName(key) {
	return type[`SYMBOLIC_${key}`];
}
