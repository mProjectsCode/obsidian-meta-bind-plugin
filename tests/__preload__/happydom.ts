import { GlobalRegistrator } from '@happy-dom/global-registrator';
import process from 'process';

GlobalRegistrator.register({
	settings: {},
});

if (process.env.LOG_TESTS === 'false') {
	console.log = () => {};
	console.debug = () => {};
}
