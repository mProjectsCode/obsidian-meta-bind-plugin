import { API } from 'packages/core/src/api/API';
import { TestMetaBind, type TestComponents } from './TestPlugin';

export class TestAPI extends API<TestComponents> {
	constructor(mb: TestMetaBind) {
		super(mb);
	}
}
