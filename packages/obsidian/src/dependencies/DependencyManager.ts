import type { Plugin } from 'obsidian';
import { Notice } from 'obsidian';
import { ErrorLevel, MetaBindDependencyError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { Dependency } from 'packages/obsidian/src/dependencies/Dependency';
import { Version } from 'packages/obsidian/src/dependencies/Version';
import type { ObsMetaBind } from 'packages/obsidian/src/main';

export class DependencyManager {
	readonly mb: ObsMetaBind;
	dependencies: Dependency[];

	constructor(mb: ObsMetaBind, dependencies: Dependency[]) {
		this.mb = mb;
		this.dependencies = dependencies;
	}

	getDependency(pluginId: string): Dependency {
		const dependency = this.dependencies.find(dependency => dependency.pluginId === pluginId);
		if (dependency === undefined) {
			throw new MetaBindDependencyError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: `Dependency violation detected`,
				cause: `Attempted to access dependency ${pluginId} which is not a listed dependency. Please report this error.`,
			});
		}
		return dependency;
	}

	private getPlugin(pluginId: string): Plugin | undefined {
		return this.mb.app.plugins.getPlugin(pluginId);
	}

	private throwPluginNotFound(pluginId: string): void {
		this.throwDependencyError(`Plugin ${pluginId} is required, but not installed. Please install the plugin.`);
	}

	private throwDependencyError(message: string): void {
		new Notice(`meta-bind | Dependency Error: ${message}`, 0);
		throw new MetaBindDependencyError({
			errorLevel: ErrorLevel.ERROR,
			effect: `Dependency violation detected`,
			cause: message,
		});
	}

	private checkDependencyVersion(dependency: Dependency, version: Version): void {
		if (Version.lessThan(version, dependency.minVersion)) {
			this.throwDependencyError(
				`Plugin ${dependency.pluginId} is outdated. Required version is at least ${dependency.minVersion}, installed version is ${version}. Please update the plugin.`,
			);
		}

		if (
			dependency.maxVersion !== undefined &&
			(Version.greaterThan(version, dependency.maxVersion) || Version.equals(version, dependency.maxVersion))
		) {
			this.throwDependencyError(
				`Plugin ${dependency.pluginId} is too new. Required version is lower than ${dependency.maxVersion}, installed version is ${version}. Please downgrade the plugin.`,
			);
		}
	}

	checkDependency(pluginId: string): Plugin {
		const dependency = this.getDependency(pluginId);

		const plugin = this.getPlugin(pluginId);
		if (plugin === undefined || plugin === null) {
			this.throwPluginNotFound(pluginId);
			throw Error('unreachable');
		}

		const version = Version.fromString(plugin.manifest.version);

		this.checkDependencyVersion(dependency, version);

		return plugin;
	}
}
