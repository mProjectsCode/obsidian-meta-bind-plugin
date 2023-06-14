import { moment } from 'obsidian';
import { mod } from '../../utils/Utils';
import { monthNames, Weekday, weekdays } from '../../settings/Settings';

export let firstWeekday: Weekday = weekdays[1];

export function setFirstWeekday(w: Weekday) {
	firstWeekday = w;
}

export function getMonthName(index: number): string {
	return monthNames[index];
}

export function getDateRows(monthIndex: number, year: number): number[] {
	const days: number = moment(new Date(year, monthIndex)).daysInMonth(); // amount of days in month
	let rows: number[] = new Array(42).fill(undefined); // empty 42 long array (28 + 7 + 7)
	const startIndex: number = getWeekDay(new Date(year, monthIndex, 1)); // index offset based on weekday of first day in month

	for (let i = 0; i < days; i++) {
		rows[i + startIndex] = i + 1;
	}

	rows = rows[rows.length - 7] ? rows : rows.slice(0, -7); // slice last week if it is empty
	rows = rows[rows.length - 7] ? rows : rows.slice(0, -7); // slice last week if it is empty

	return rows;
}

// first day of the week is monday where I live
export function getWeekDay(date: Date): number {
	return mod(date.getDay() - firstWeekday.index, 7);
}

// first day of the week is monday where I live
export function getWeekDays(): string[] {
	const sortedWeekdays: Weekday[] = weekdays
		.map(x => ({
			index: mod(x.index - firstWeekday.index, 7),
			name: x.name,
			shortName: x.shortName,
		}))
		.sort((a, b) => {
			return a.index - b.index;
		});
	// console.log(sortedWeekdays);
	return sortedWeekdays.map(x => x.shortName);
}

export function genSvelteId(): () => number {
	let id = 0;
	return () => {
		return ++id;
	};
}
