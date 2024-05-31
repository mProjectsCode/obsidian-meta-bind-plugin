import { API } from 'packages/core/src/api/API';
import { TestPlugin } from './TestPlugin';

export class TestAPI extends API<TestPlugin> {
	constructor(plugin: TestPlugin) {
		super(plugin);
	}
}
