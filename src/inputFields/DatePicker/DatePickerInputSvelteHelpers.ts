import {moment} from 'obsidian';

const monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export function getMonthName(index: number): string {
	return monthNames[index];
}

export function getDateRows(monthIndex: number, year: number): number[] {
	const days: number = moment(new Date(year, monthIndex)).daysInMonth(); // amount of days in month
	const rows: number[] = (new Array(42)).fill(undefined); // empty 42 long array
	const startIndex: number = getWeekDay(new Date(year, monthIndex, 1)); // index offset based on weekday of first day in month

	for (let i = 0; i < days; i++) {
		rows[i + startIndex] = i + 1;
	}

	return rows[rows.length - 7] ? rows : rows.slice(0, -7);
}

// first day of the week is monday where I live
export function getWeekDay(date: Date): number {
	return date.getDay() === 0 ? 6 : date.getDay() - 1;
}

// first day of the week is monday where I live
export function getWeekDays(): string[] {
	return ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
}

export function uuid(): () => number {
	let id = 0;
	return () => {
		return ++id;
	};
}
