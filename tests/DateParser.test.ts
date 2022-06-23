import {Date, DateParser} from '../src/Parsers/DateParser';


test('stringify EU date', () => {
	const date = new Date();
	date.setDay(2);
	date.setMonth(3);
	date.setYear(3456);

	expect(DateParser.stringifyEuDate(date)).toEqual('02/03/3456');
});

test('parse EU date', () => {
	const expectedResult = new Date();
	expectedResult.setDay(2);
	expectedResult.setMonth(3);
	expectedResult.setYear(3456);

	expect(DateParser.parseEuDate('02/03/3456')).toEqual(expectedResult);
});

test('stringify US date', () => {
	const date = new Date();
	date.setMonth(3);
	date.setDay(2);
	date.setYear(3456);

	expect(DateParser.stringifyUsDate(date)).toEqual('03/02/3456');
});

test('parse US date', () => {
	const expectedResult = new Date();
	expectedResult.setMonth(3);
	expectedResult.setDay(2);
	expectedResult.setYear(3456);

	expect(DateParser.parseUsDate('03/02/3456')).toEqual(expectedResult);
});

test('stringify fancy US date', () => {
	const date = new Date();
	date.setMonth(3);
	date.setDay(2);
	date.setYear(3456);

	expect(DateParser.stringifyUsFancyDate(date)).toEqual('March 2, 3456');
	expect(DateParser.stringifyUsFancyDateShort(date)).toEqual('Mar 2, 3456');
});

test('parse fancy US date', () => {
	const expectedResult = new Date();
	expectedResult.setMonth(3);
	expectedResult.setDay(2);
	expectedResult.setYear(3456);

	expect(DateParser.parseUsFancyDate('March 2, 3456')).toEqual(expectedResult);
	expect(DateParser.parseUsFancyDate('March 2,3456')).toEqual(expectedResult);
	expect(DateParser.parseUsFancyDate('Mar 2, 3456')).toEqual(expectedResult);
	expect(DateParser.parseUsFancyDate('Mar 2,3456')).toEqual(expectedResult);
});

test('Default date', () => {
	const date = new Date();

	expect(date.getDay()).toEqual(1);
	expect(date.getUniformDay()).toEqual('01');
	expect(date.getMonth()).toEqual(1);
	expect(date.getUniformMonth()).toEqual('01');
	expect(date.getMonthName()).toEqual('January');
	expect(date.getMonthNameShort()).toEqual('Jan');
	expect(date.getYear()).toEqual(2022);
	expect(date.getUniformYear()).toEqual('2022');
});

test('Date edge cases', () => {
	const date = new Date();

	date.setDay(50);
	expect(date.getDay()).not.toEqual(50);
	date.setDay(-1);
	expect(date.getDay()).not.toEqual(-1);
	date.setDayFromString('a');
	expect(date.getDay()).not.toEqual('a');

	date.setMonth(50);
	expect(date.getMonth()).not.toEqual(50);
	date.setMonth(-1);
	expect(date.getMonth()).not.toEqual(-1);
	date.setMonthFromString('a');
	expect(date.getMonth()).not.toEqual('a');
	date.setMonthFromName('a');
	expect(date.getMonth()).not.toEqual('a');

	date.setYearFromString('a');
	expect(date.getYear()).not.toEqual('a');
});
