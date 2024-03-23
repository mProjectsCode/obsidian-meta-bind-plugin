// import { beforeEach, describe, expect, test } from 'bun:test';
// import { Time, TimeParser } from '../../packages/core/src/parsers/TimeParser';
//
// describe('time stringify', () => {
// 	describe('should stringify time', () => {
// 		test.each([
// 			['00:00', 0, 0],
// 			['01:05', 1, 5],
// 			['03:25', 3, 25],
// 			['23:59', 23, 59],
// 		])('%s', (expected, hour, minute) => {
// 			const time = new Time();
// 			time.setHour(hour);
// 			time.setMinute(minute);
//
// 			expect(TimeParser.stringify(time)).toEqual(expected);
// 		});
// 	});
// });
//
// describe('time parser', () => {
// 	describe('should succeed on valid time', () => {
// 		test.each([
// 			['00:00', 0, 0],
// 			['01:05', 1, 5],
// 			['03:25', 3, 25],
// 			['23:59', 23, 59],
// 		])('%s', (time, expectedHour, expectedMinute) => {
// 			expect(TimeParser.parse(time)?.getHour()).toBe(expectedHour);
// 			expect(TimeParser.parse(time)?.getMinute()).toBe(expectedMinute);
// 		});
// 	});
//
// 	describe('should fail on invalid time format', () => {
// 		test.each([['00:0'], ['0:05'], ['304:25'], ['25a'], [''], ['23h:15m'], ['23#15']])('%s', time => {
// 			expect<Time | undefined>(TimeParser.parse(time)).toBe(undefined);
// 		});
// 	});
//
// 	describe('should fail on time out of bounds', () => {
// 		test.each([['-01:00'], ['24:05'], ['26:05'], ['05:60'], ['05:99']])('%s', time => {
// 			expect<Time | undefined>(TimeParser.parse(time)).toBe(undefined);
// 		});
// 	});
// });
//
// describe('time class', () => {
// 	describe('should not be possible to crete invalid time', () => {
// 		let time: Time;
//
// 		beforeEach(() => {
// 			time = new Time();
// 		});
//
// 		test('set minute to 100', () => {
// 			time.setMinute(100);
// 			expect(time.getMinute()).not.toEqual(100);
// 		});
//
// 		test('set minute to -1', () => {
// 			time.setMinute(-1);
// 			expect(time.getMinute()).not.toEqual(-1);
// 		});
//
// 		test("set minute to 'a'", () => {
// 			time.setMinuteFromString('a');
// 			expect(time.getMinute()).not.toEqual('a');
// 		});
//
// 		test('set hour to 50', () => {
// 			time.setHour(50);
// 			expect(time.getHour()).not.toEqual(50);
// 		});
//
// 		test('set hour to -1', () => {
// 			time.setHour(-1);
// 			expect(time.getHour()).not.toEqual(-1);
// 		});
//
// 		test("set hour to 'a'", () => {
// 			time.setHourFromString('a');
// 			expect(time.getHour()).not.toEqual('a');
// 		});
// 	});
// });

export {};
