import {MetaBindInternalError} from '../utils/Utils';

export class Date {
	private _day: number;
	private _month: number;
	private _year: number;

	private _monthMap: Record<number, string> = {
		1: 'January',
		2: 'February',
		3: 'March',
		4: 'April',
		5: 'May',
		6: 'June',
		7: 'July',
		8: 'August',
		9: 'September',
		10: 'October',
		11: 'November',
		12: 'December',
	};

	private _monthMapShort: Record<number, string> = {
		1: 'Jan',
		2: 'Feb',
		3: 'Mar',
		4: 'Apr',
		5: 'May',
		6: 'Jun',
		7: 'Jul',
		8: 'Aug',
		9: 'Sep',
		10: 'Oct',
		11: 'Nov',
		12: 'Dec',
	};

	constructor() {
		this._day = DateParser.getDefaultDay();
		this._month = DateParser.getDefaultMonth();
		this._year = DateParser.getDefaultYear();
	}

	public getDay(): number {
		return this._day;
	}

	public setDay(value: number): void  {
		if (value < 1 || value > 31) {
			return;
		}
		this._day = value;
	}

	public getMonth(): number {
		return this._month;
	}

	public setMonth(value: number): void  {
		if (value < 1 || value > 12) {
			return;
		}
		this._month = value;
	}

	public getYear(): number {
		return this._year;
	}

	public setYear(value: number): void  {
		this._year = value;
	}

	public getUniformDay(): string {
		return ('00' + this.getDay().toString()).slice(-2);
	}

	public getUniformMonth(): string {
		return ('00' + this.getMonth().toString()).slice(-2);
	}

	public getUniformYear(): string {
		return ('0000' + this.getYear().toString()).slice(-4);
	}

	public setDayFromString(str: string): void  {
		const v = Number.parseInt(str);
		this.setDay(Number.isNaN(v) ? DateParser.getDefaultDay() : v);
	}

	public setMonthFromString(str: string): void  {
		const v = Number.parseInt(str);
		this.setMonth(Number.isNaN(v) ? DateParser.getDefaultMonth() : v);
	}

	public setYearFromString(str: string): void {
		const v = Number.parseInt(str);
		this.setYear(Number.isNaN(v) ? DateParser.getDefaultYear() : v);
	}

	public getMonthName(): string {
		return this._monthMap[this.getMonth()];
	}

	public getMonthNameShort(): string {
		return this._monthMapShort[this.getMonth()];
	}

	public setMonthFromName(name: string): void {
		for (const [key, value] of Object.entries(this._monthMap)) {
			if (value === name) {
				this.setMonthFromString(key);
				return;
			}
		}

		for (const [key, value] of Object.entries(this._monthMapShort)) {
			if (value === name) {
				this.setMonthFromString(key);
				return;
			}
		}
	}
}

export enum DateFormat {
	US = 'us',
	EU = 'eu',
	FANCY_US = 'f_us',
	FANCY_SHORT_US = 'fs_us',
}

export class DateParser {
	public static dateFormat: DateFormat;

	public static stringify(date: Date): string {
		if (DateParser.dateFormat === DateFormat.US) {
			return DateParser.stringifyUsDate(date);
		} else if (DateParser.dateFormat === DateFormat.EU) {
			return DateParser.stringifyEuDate(date);
		} else if (DateParser.dateFormat === DateFormat.FANCY_US) {
			return DateParser.stringifyUsFancyDate(date);
		} else if (DateParser.dateFormat === DateFormat.FANCY_SHORT_US) {
			return DateParser.stringifyUsFancyDateShort(date);
		}
		throw new MetaBindInternalError('date format setting does not match any supported date format');
	}

	public static parse(dateString: string): Date | undefined {
		if (DateParser.dateFormat === DateFormat.US) {
			return DateParser.parseUsDate(dateString);
		} else if (DateParser.dateFormat === DateFormat.EU) {
			return DateParser.parseEuDate(dateString);
		} else if (DateParser.dateFormat === DateFormat.FANCY_US) {
			return DateParser.parseUsFancyDate(dateString);
		} else if (DateParser.dateFormat === DateFormat.FANCY_SHORT_US) {
			return DateParser.parseUsFancyDate(dateString);
		}
		throw new MetaBindInternalError('date format setting does not match any supported date format');
	}

	public static stringifyEuDate(date: Date): string {
		return `${date.getUniformDay()}/${date.getUniformMonth()}/${date.getUniformYear()}`;
	}

	public static parseEuDate(dateString: string): Date | undefined {
		const date: Date = DateParser.getDefaultDate();

		const dateParts = dateString.split('/');
		if (dateParts.length !== 3) {
			return undefined;
		}

		date.setDayFromString(dateParts[0]);
		date.setMonthFromString(dateParts[1]);
		date.setYearFromString(dateParts[2]);

		return date;
	}

	public static stringifyUsDate(date: Date): string {
		return `${date.getUniformMonth()}/${date.getUniformDay()}/${date.getUniformYear()}`;
	}

	public static parseUsDate(dateString: string): Date | undefined {
		const date: Date = DateParser.getDefaultDate();

		const dateParts = dateString.split('/');
		if (dateParts.length !== 3) {
			return undefined;
		}

		date.setMonthFromString(dateParts[0]);
		date.setDayFromString(dateParts[1]);
		date.setYearFromString(dateParts[2]);

		return date;
	}

	public static stringifyUsFancyDate(date: Date): string {
		return `${date.getMonthName()} ${date.getDay().toString()}, ${date.getYear().toString()}`;
	}

	public static stringifyUsFancyDateShort(date: Date): string {
		return `${date.getMonthNameShort()} ${date.getDay().toString()}, ${date.getYear().toString()}`;
	}

	public static parseUsFancyDate(dateString: string): Date | undefined {
		const date: Date = DateParser.getDefaultDate();

		const dateParts = dateString.split(',').map(x => x.trim());
		if (dateParts.length !== 2) {
			return undefined;
		}
		const datePartsParts = dateParts[0].split(' ');
		if (datePartsParts.length !== 2) {
			return undefined;
		}

		// console.log(datePartsParts)

		date.setMonthFromName(datePartsParts[0]);
		date.setDayFromString(datePartsParts[1]);
		date.setYearFromString(dateParts[1]);

		return date;
	}

	public static getDefaultDate(): Date {
		return new Date();
	}

	public static getDefaultDay(): number {
		return 1;
	}

	public static getDefaultMonth(): number {
		return 1;
	}

	public static getDefaultYear(): number {
		return 2022;
	}
}
