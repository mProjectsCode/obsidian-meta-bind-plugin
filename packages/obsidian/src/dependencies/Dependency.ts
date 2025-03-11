import type { Version } from 'packages/obsidian/src/dependencies/Version';

export interface Dependency {
	name: string;
	pluginId: string;
	/**
	 * The minimum version, inclusive.
	 */
	minVersion: Version;
	/**
	 * The maximum version, exclusive.
	 */
	maxVersion?: Version;
}
