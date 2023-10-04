import { toHaveWarnings, toHaveErrors } from './customMatchers';

expect.extend({
	toHaveWarnings,
	toHaveErrors,
});
