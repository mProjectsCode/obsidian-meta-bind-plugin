import { Subprocess } from 'bun';
import stringArgv from 'string-argv';

export enum Verboseness {
	QUITET,
	NORMAL,
	VERBOSE,
}

function exec(c: string, cwd?: string): Subprocess<'ignore', 'pipe', 'inherit'> {
	return Bun.spawn(stringArgv(c), { cwd: cwd });
}

export async function $(
	cmd: string,
	cwd?: string | undefined,
	verboseness: Verboseness = Verboseness.NORMAL,
): Promise<{ stdout: string; stderr: string; exit: number }> {
	if (verboseness === Verboseness.NORMAL || verboseness === Verboseness.VERBOSE) {
		if (cwd !== undefined) {
			console.log(`\n${CMD_FMT.Bright}running${CMD_FMT.Reset} in ${cwd} - ${cmd}\n`);
		} else {
			console.log(`\n${CMD_FMT.Bright}running${CMD_FMT.Reset} - ${cmd}\n`);
		}
	}

	const proc = exec(cmd, cwd);
	const stdout = await new Response(proc.stdout).text();
	const stderr = await new Response(proc.stderr).text();

	if (verboseness === Verboseness.VERBOSE) {
		if (stdout !== '') {
			console.log(
				stdout
					.split('\n')
					.map(x => `${CMD_FMT.FgGray}>${CMD_FMT.Reset} ${x}\n`)
					.join(''),
			);
		}

		if (stderr !== '') {
			console.log(
				stderr
					.split('\n')
					.map(x => `${CMD_FMT.FgRed}>${CMD_FMT.Reset} ${x}\n`)
					.join(''),
			);
		}
	}

	const exit = await proc.exited;

	if (verboseness === Verboseness.NORMAL || verboseness === Verboseness.VERBOSE) {
		if (exit === 0) {
			console.log(`${CMD_FMT.FgGreen}success${CMD_FMT.Reset} - ${cmd}\n`);
		} else {
			console.log(`${CMD_FMT.FgRed}fail${CMD_FMT.Reset} - ${cmd} - code ${exit}\n`);
		}
	}

	return {
		stdout,
		stderr,
		exit,
	};
}

export async function $seq(
	cmds: string[],
	onError: (cmd: string, index: number) => void,
	onSuccess: () => void,
	cwd?: string | undefined,
	verboseness: Verboseness = Verboseness.NORMAL,
): Promise<void> {
	const results = [];
	for (let i = 0; i < cmds.length; i += 1) {
		const cmd = cmds[i];
		const result = await $(cmd, cwd, verboseness);

		if (result.exit !== 0) {
			onError(cmd, i);
			return;
		}

		results.push(result);
	}
	onSuccess();
}

export async function $input(message: string): Promise<string> {
	console.write(`${message} `);
	const stdin = Bun.stdin.stream();
	const reader = stdin.getReader();
	const chunk = await reader.read();
	reader.releaseLock();
	const text = Buffer.from(chunk.value ?? '').toString();
	return text.trim();
}

export async function $choice(message: string, options: string[]): Promise<number> {
	console.log(`${message} `);

	let optionNumbers = new Map<string, number>();

	for (let i = 0; i < options.length; i++) {
		const option = options[i];
		console.log(`[${i}] ${option}`);

		optionNumbers.set(i.toString(), i);
	}

	let ret: undefined | number = undefined;

	while (ret === undefined) {
		const selectedStr = await $input(`Select [${[...optionNumbers.keys()].join('/')}]:`);

		ret = optionNumbers.get(selectedStr);

		if (ret === undefined) {
			console.log(`${CMD_FMT.FgRed}invalid selection, please select a valid option${CMD_FMT.Reset}`);
		}
	}

	return ret;
}

export async function $confirm(message: string, onReject: () => void): Promise<void> {
	while (true) {
		const answer = await $input(`${message} [Y/N]?`);

		if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
			return;
		}

		if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
			onReject();
			return;
		}

		console.log(`${CMD_FMT.FgRed}invalid selection, please select a valid option${CMD_FMT.Reset}`);
	}
}

export const CMD_FMT = {
	Reset: '\x1b[0m',
	Bright: '\x1b[1m',
	Dim: '\x1b[2m',
	Underscore: '\x1b[4m',
	Blink: '\x1b[5m',
	Reverse: '\x1b[7m',
	Hidden: '\x1b[8m',

	FgBlack: '\x1b[30m',
	FgRed: '\x1b[31m',
	FgGreen: '\x1b[32m',
	FgYellow: '\x1b[33m',
	FgBlue: '\x1b[34m',
	FgMagenta: '\x1b[35m',
	FgCyan: '\x1b[36m',
	FgWhite: '\x1b[37m',
	FgGray: '\x1b[90m',

	BgBlack: '\x1b[40m',
	BgRed: '\x1b[41m',
	BgGreen: '\x1b[42m',
	BgYellow: '\x1b[43m',
	BgBlue: '\x1b[44m',
	BgMagenta: '\x1b[45m',
	BgCyan: '\x1b[46m',
	BgWhite: '\x1b[47m',
	BgGray: '\x1b[100m',
};
