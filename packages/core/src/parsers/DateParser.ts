import { type Moment } from 'moment';
import moment from 'moment';

export class DateParser {
	public static dateFormat: string;

	public static stringify(date: Moment): string {
		return date.format(this.dateFormat);
	}

	public static parse(dateString: string): Moment {
		return moment(dateString, DateParser.dateFormat);
	}

	public static getDefaultDate(): Moment {
		return moment(new Date());
	}

	public static getDefaultDay(): number {
		return new Date().getDate();
	}

	public static getDefaultMonth(): number {
		return 1;
	}

	public static getDefaultYear(): number {
		return new Date().getFullYear();
	}
}
