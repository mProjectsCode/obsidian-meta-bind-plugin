export class Time {
	private _hour: number;
	private _minute: number;

	constructor() {
		this.setHour(TimeParser.getDefaultHour());
		this.setMinute(TimeParser.getDefaultMinute());
	}

	public getHour(): number {
		return this._hour;
	}

	public setHour(value: number) {
		if (value < 0 || value > 24) {
			return;
		}
		this._hour = value;
	}

	public getMinute(): number {
		return this._minute;
	}

	public setMinute(value: number) {
		if (value < 0 || value > 59) {
			return;
		}
		this._minute = value;
	}

	public getUniformHour(): string {
		return ('00' + this.getHour().toString()).slice(-2);
	}

	public getUniformMinute(): string {
		return ('00' + this.getMinute().toString()).slice(-2);
	}

	public setHourFromString(str: string) {
		let v = Number.parseInt(str);
		this.setHour(Number.isNaN(v) ? TimeParser.getDefaultHour() : v);
	}

	public setMinuteFromString(str: string) {
		let v = Number.parseInt(str);
		this.setMinute(Number.isNaN(v) ? TimeParser.getDefaultMinute() : v);
	}
}

export class TimeParser {
	public static parse(timeString: string): Time {
		const time: Time = TimeParser.getDefaultTime();

		const timeParts = timeString.split(':');
		if (timeParts.length !== 2) {
			return null;
		}

		time.setHourFromString(timeParts[0]);
		time.setMinuteFromString(timeParts[1]);

		return time;
	}

	public static stringify(time: Time): string {
		return `${time.getUniformHour()}:${time.getUniformMinute()}`;
	}

	public static getDefaultTime(): Time {
		return new Time();
	}

	public static getDefaultHour(): number {
		return 0;
	}

	public static getDefaultMinute(): number {
		return 0;
	}
}
