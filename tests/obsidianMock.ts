import { mock } from 'bun:test';
import Moment from 'moment';

mock.module('obsidian', () => ({
	setIcon(iconEl: HTMLElement, iconName: string): void {
		// do nothing
	},
	moment: Moment,
}));
