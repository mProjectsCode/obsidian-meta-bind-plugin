import { moment } from 'obsidian';

export class DateParser {
	public static dateFormat: string;

	public static stringify(date: moment.Moment): string {
		return date.format(this.dateFormat);
	}

	public static parse(dateString: string): moment.Moment {
		return moment(dateString, DateParser.dateFormat);
	}

	public static getDefaultDate(): moment.Moment {
		return moment(new Date());
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
