import { Time, TimeParser } from '../src/parsers/TimeParser';

test('stringify time', () => {
	const time = new Time();
	time.setHour(6);
	time.setMinute(9);

	expect(TimeParser.stringify(time)).toEqual('06:09');
});

test('parse time', () => {
	const time = new Time();
	time.setHour(6);
	time.setMinute(9);

	expect(TimeParser.parse('06:09')).toEqual(time);
});

test('Time edge cases', () => {
	const time = new Time();

	time.setMinute(100);
	expect(time.getMinute()).not.toEqual(100);
	time.setMinute(-1);
	expect(time.getMinute()).not.toEqual(-1);
	time.setMinuteFromString('a');
	expect(time.getMinute()).not.toEqual('a');

	time.setHour(50);
	expect(time.getHour()).not.toEqual(50);
	time.setHour(-1);
	expect(time.getHour()).not.toEqual(-1);
	time.setHourFromString('a');
	expect(time.getHour()).not.toEqual('a');
});
