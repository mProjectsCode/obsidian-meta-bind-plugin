import { GlobalRegistrator } from '@happy-dom/global-registrator';
import process from 'process';

const oldConsole = console;
GlobalRegistrator.register({
	settings: {},
});
if (process.env.LOG_TESTS) {
	window.console = oldConsole;
}
