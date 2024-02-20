import { type Plugin } from 'obsidian';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { ErrorLevel, MetaBindDependencyError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { type Dependency } from 'packages/obsidian/src/dependencies/Dependency';
import { Version } from 'packages/obsidian/src/dependencies/Version';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { ErrorCollectionViewModal } from 'packages/obsidian/src/modals/ErrorCollectionViewModal';

export class DependencyManager {
	readonly plugin: MetaBindPlugin;
	readonly dependencies: Dependency[];

	constructor(plugin: MetaBindPlugin, dependencies: Dependency[]) {
		this.plugin = plugin;
		this.dependencies = dependencies;
	}

	getDependency(pluginId: string): Dependency {
		const dependency = this.dependencies.find(dependency => dependency.pluginId === pluginId);
		if (dependency === undefined) {
			throw new MetaBindDependencyError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: `Dependency Violation Detected`,
				cause: `Attempted to access dependency ${pluginId} which is not a listed dependency. Please report this error.`,
			});
		}
		return dependency;
	}

	private getPlugin(pluginId: string): Plugin | undefined {
		return this.plugin.app.plugins.getPlugin(pluginId);
	}

	private throwPluginNotFound(pluginId: string): void {
		throw new MetaBindDependencyError({
			errorLevel: ErrorLevel.ERROR,
			effect: `Dependency Violation Detected`,
			cause: `Plugin ${pluginId} is required, but not installed. Please install the plugin.`,
		});
	}

	private checkDependencyVersion(dependency: Dependency, version: Version): void {
		if (Version.lessThan(version, dependency.minVersion)) {
			throw new MetaBindDependencyError({
				errorLevel: ErrorLevel.ERROR,
				effect: `Dependency Violation Detected`,
				cause: `Plugin ${dependency.pluginId} is outdated. Required version is at least ${dependency.minVersion}, installed version is ${version}. Please update the plugin.`,
			});
		}

		if (
			dependency.maxVersion !== undefined &&
			(Version.greaterThan(version, dependency.maxVersion) || Version.equals(version, dependency.maxVersion))
		) {
			throw new MetaBindDependencyError({
				errorLevel: ErrorLevel.ERROR,
				effect: `Dependency Violation Detected`,
				cause: `Plugin ${dependency.pluginId} is too new. Required version is lower than ${dependency.maxVersion}, installed version is ${version}. Please downgrade the plugin.`,
			});
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

	private checkDependencyOnStartup(pluginId: string): void {
		const dependency = this.getDependency(pluginId);

		if (!this.plugin.app.plugins.enabledPlugins.has(pluginId)) {
			this.throwPluginNotFound(pluginId);
			throw Error('unreachable');
		}

		const version = Version.fromString(this.plugin.app.plugins.manifests[pluginId].version);

		this.checkDependencyVersion(dependency, version);
	}

	checkDependenciesOnStartup(): boolean {
		const errorCollection = new ErrorCollection('Dependency Validation');

		for (const dependency of this.dependencies) {
			if (dependency.checkOnStartup) {
				try {
					this.checkDependencyOnStartup(dependency.pluginId);
				} catch (e) {
					errorCollection.add(e);
				}
			}
		}

		if (errorCollection.hasErrors()) {
			const modal = new ErrorCollectionViewModal(this.plugin.app, {
				errorCollection: errorCollection,
				text: "The following errors were detected during dependency validation. The plugin won't load until these errors have been resolved. Please install the required plugins and restart Obsidian.",
			});
			modal.open();
			return true;
		}

		return false;
	}
}
