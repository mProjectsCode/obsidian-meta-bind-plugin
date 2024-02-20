import * as fs from 'fs';

interface Stat {
	fileType: string;
	count: number;
	lines: number;
}

abstract class StatsBase {
	parent: StatsBase | undefined;
	path: string;
	name: string;
	stats: Stat[];

	constructor(parent: StatsBase | undefined, path: string, name: string, stats: Stat[]) {
		this.parent = parent;

		this.path = path;
		this.name = name;
		this.stats = stats;
	}

	abstract addChild(child: StatsBase): void;

	abstract mergeStats(stats: Stat[]): void;

	abstract print(depth: number, lastChildArr: boolean[]): void;

	abstract sort(): void;

	getPrefix(depth: number, lastChildArr: boolean[]): string {
		let prefix = '';
		for (let i = 0; i < depth; i++) {
			prefix += lastChildArr[i] ? '   ' : '│  ';
		}

		if (lastChildArr.at(-1)) {
			prefix += '└─ ';
		} else {
			prefix += '├─ ';
		}

		return prefix;
	}
}

class FolderStats extends StatsBase {
	children: StatsBase[];

	constructor(parent: StatsBase | undefined, path: string, name: string) {
		super(parent, path, name, []);

		this.children = [];
	}

	addChild(child: StatsBase) {
		this.children.push(child);
		this.mergeStats(child.stats);
	}

	mergeStats(stats: Stat[]): void {
		// console.log(this, stats);
		for (const stat of stats) {
			const existingStat = this.stats.find(s => s.fileType === stat.fileType);
			if (existingStat) {
				existingStat.count += stat.count;
				existingStat.lines += stat.lines;
			} else {
				this.stats.push(structuredClone(stat));
			}
		}

		this.parent?.mergeStats(stats);
	}

	print(depth: number, lastChildArr: boolean[]): void {
		console.log(
			`${this.getPrefix(depth, lastChildArr)}${this.name} | ${this.stats.reduce((acc, s) => acc + s.count, 0)} files | ${this.stats.reduce((acc, s) => acc + s.lines, 0)} lines`,
		);
		for (let i = 0; i < this.children.length; i++) {
			const child = this.children[i];
			child.print(depth + 1, [...lastChildArr, i === this.children.length - 1]);
		}
	}

	sort(): void {
		this.children.sort((a, b) => {
			if (a instanceof FolderStats && b instanceof FileStats) {
				return 1;
			} else if (a instanceof FileStats && b instanceof FolderStats) {
				return -1;
			} else {
				return a.name.localeCompare(b.name);
			}
		});
		this.children.forEach(c => c.sort());
	}
}

class FileStats extends StatsBase {
	constructor(parent: StatsBase, path: string, name: string, stats: Stat[]) {
		super(parent, path, name, stats);
	}

	addChild(_child: StatsBase): void {
		throw new Error('Cannot add child to file');
	}

	mergeStats(_stats: Stat[]): void {
		throw new Error('Cannot merge stats to file');
	}

	print(depth: number, lastChildArr: boolean[]): void {
		console.log(`${this.getPrefix(depth, lastChildArr)}${this.name} | ${this.stats[0].lines} lines`);
	}

	sort(): void {}
}

function collectStats() {
	const root = new FolderStats(undefined, './packages', 'packages');
	const ignore = ['node_modules', 'extraTypes', 'bun.lockb'];

	const todo: FolderStats[] = [root];

	while (todo.length > 0) {
		const current = todo.pop()!;
		const children = fs.readdirSync(current.path, { withFileTypes: true });

		for (const child of children) {
			if (ignore.includes(child.name)) {
				continue;
			}

			if (child.isDirectory()) {
				const folder = new FolderStats(current, `${current.path}/${child.name}`, child.name);
				current.addChild(folder);

				todo.push(folder);
			} else {
				const content = fs.readFileSync(`${current.path}/${child.name}`, 'utf-8');

				const file = new FileStats(current, `${current.path}/${child.name}`, child.name, [
					{
						fileType: child.name.split('.').splice(1).join('.'),
						count: 1,
						lines: content.split('\n').length,
					},
				]);
				current.addChild(file);
			}
		}
	}

	root.sort();

	root.print(0, [true]);
}

collectStats();
