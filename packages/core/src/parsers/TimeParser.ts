import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';

export class Time {
	private _hour: number;
	private _minute: number;

	constructor() {
		this._hour = TimeParser.getDefaultHour();
		this._minute = TimeParser.getDefaultHour();
	}

	public getHour(): number {
		return this._hour;
	}

	public setHour(value: number): void {
		if (value < 0 || value > 24) {
			this._hour = TimeParser.getDefaultHour();
			return;
		}
		this._hour = value;
	}

	public getMinute(): number {
		return this._minute;
	}

	public setMinute(value: number): void {
		if (value < 0 || value > 59) {
			this._minute = TimeParser.getDefaultMinute();
			return;
		}
		this._minute = value;
	}

	public getUniformHour(): string {
		return this.getHour().toString().padStart(2, '0');
	}

	public getUniformMinute(): string {
		return this.getMinute().toString().padStart(2, '0');
	}

	public setHourFromString(str: string): void {
		const v = Number.parseInt(str);
		this.setHour(Number.isNaN(v) ? TimeParser.getDefaultHour() : v);
	}

	public setMinuteFromString(str: string): void {
		const v = Number.parseInt(str);
		this.setMinute(Number.isNaN(v) ? TimeParser.getDefaultMinute() : v);
	}
}

const timeParser = P.sequenceMap(
	(a, b, _, c, d) => {
		return {
			hour: Number.parseInt(a + b),
			minute: Number.parseInt(c + d),
		};
	},
	P_UTILS.digit(),
	P_UTILS.digit(),
	P.string(':'),
	P_UTILS.digit(),
	P_UTILS.digit(),
);

export class TimeParser {
	public static parse(timeString: string | null | undefined): Time | undefined {
		if (!timeString) {
			return undefined;
		}

		const time: Time = TimeParser.getDefaultTime();

		const parsedTime = timeParser.tryParse(timeString);

		if (!parsedTime.success) {
			return undefined;
		}
		if (Number.isNaN(parsedTime.value.hour) || Number.isNaN(parsedTime.value.minute)) {
			return undefined;
		}
		if (parsedTime.value.hour < 0 || parsedTime.value.hour >= 24) {
			return undefined;
		}
		if (parsedTime.value.minute < 0 || parsedTime.value.minute >= 60) {
			return undefined;
		}

		time.setHour(parsedTime.value.hour);
		time.setMinute(parsedTime.value.minute);

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
