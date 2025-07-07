import type { App, MarkdownPostProcessorContext, WorkspaceLeaf } from 'obsidian';
import { loadPrism, Plugin, stringifyYaml } from 'obsidian';
import { MetaBind, MetaBindBuild } from 'packages/core/src';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';
import { EMBED_MAX_DEPTH } from 'packages/core/src/config/FieldConfigs';
import {
	GlobalMetadataSource,
	InternalMetadataSource,
	ScopeMetadataSource,
} from 'packages/core/src/metadata/InternalMetadataSources';
import { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import { BindTargetStorageType } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { MetaBindPluginSettings } from 'packages/core/src/Settings';
import { DEFAULT_SETTINGS } from 'packages/core/src/Settings';
import { areObjectsEqual } from 'packages/core/src/utils/Utils';
import { registerCm5HLModes } from 'packages/obsidian/src/cm6/Cm5_Modes';
import { createMarkdownRenderChildWidgetEditorPlugin } from 'packages/obsidian/src/cm6/Cm6_ViewPlugin';
import { DependencyManager } from 'packages/obsidian/src/dependencies/DependencyManager';
import { Version } from 'packages/obsidian/src/dependencies/Version';
import { createEditorMenu } from 'packages/obsidian/src/EditorMenu';
import { ObsAPI } from 'packages/obsidian/src/ObsAPI';
import { ObsFileAPI } from 'packages/obsidian/src/ObsFileAPI';
import { ObsInternalAPI } from 'packages/obsidian/src/ObsInternalAPI';
import { ObsMetadataSource } from 'packages/obsidian/src/ObsMetadataSource';
import { ObsNotePosition } from 'packages/obsidian/src/ObsNotePosition';
import { PlaygroundView, MB_PLAYGROUND_VIEW_TYPE } from 'packages/obsidian/src/playground/PlaygroundView';
import { MetaBindSettingTab } from 'packages/obsidian/src/settings/SettingsTab';

export interface ObsComponents {
	api: ObsAPI;
	internal: ObsInternalAPI;
	file: ObsFileAPI;
}

export class ObsMetaBind extends MetaBind<ObsComponents> {
	app: App;
	plugin: ObsMetaBindPlugin;

	dependencyManager: DependencyManager;

	constructor(plugin: ObsMetaBindPlugin) {
		super();

		this.app = plugin.app;
		this.plugin = plugin;

		this.setComponents({
			api: new ObsAPI(this),
			internal: new ObsInternalAPI(this),
			file: new ObsFileAPI(this),
		});

		this.plugin.addSettingTab(new MetaBindSettingTab(this.app, this));

		// check dependencies
		this.dependencyManager = new DependencyManager(this, []);
		this.setUpDependencies();

		this.setUpMetadataManager();

		this.loadTemplates();

		// register all post processors for MDRCs
		this.addPostProcessors();
		this.plugin.registerEditorExtension(createMarkdownRenderChildWidgetEditorPlugin(this));

		this.addCommands();
		registerCm5HLModes(this);

		// misc
		this.plugin.registerView(MB_PLAYGROUND_VIEW_TYPE, leaf => new PlaygroundView(leaf, this));
		this.addStatusBarBuildIndicator();

		if (this.getSettings().enableEditorRightClickMenu) {
			this.plugin.registerEvent(
				this.app.workspace.on('editor-menu', (menu, editor) => {
					createEditorMenu(menu, editor, this);
				}),
			);
		}
	}

	private setUpDependencies(): void {
		this.dependencyManager.dependencies = [
			{
				name: 'Dataview',
				pluginId: 'dataview',
				minVersion: new Version(0, 5, 64),
			},
			{
				name: 'JS Engine',
				pluginId: 'js-engine',
				minVersion: new Version(0, 3, 0),
			},
			{
				name: 'Templater',
				pluginId: 'templater-obsidian',
				minVersion: new Version(2, 2, 3),
			},
		];
	}

	private setUpMetadataManager(): void {
		this.metadataManager = new MetadataManager();
		this.metadataManager.registerSource(
			new ObsMetadataSource(this, BindTargetStorageType.FRONTMATTER, this.metadataManager),
		);
		this.metadataManager.registerSource(
			new InternalMetadataSource(BindTargetStorageType.MEMORY, this.metadataManager),
		);
		this.metadataManager.registerSource(
			new GlobalMetadataSource(BindTargetStorageType.GLOBAL_MEMORY, this.metadataManager),
		);
		this.metadataManager.registerSource(new ScopeMetadataSource(BindTargetStorageType.SCOPE, this.metadataManager));
		this.metadataManager.setDefaultSource(BindTargetStorageType.FRONTMATTER);

		this.plugin.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				this.mountableManager.unloadFile(oldPath);
				this.metadataManager.onStoragePathRenamed(oldPath, file.path);
			}),
		);

		this.plugin.registerEvent(
			this.app.vault.on('delete', file => {
				this.mountableManager.unloadFile(file.path);
				this.metadataManager.onStoragePathDeleted(file.path);
			}),
		);

		this.plugin.registerInterval(
			window.setInterval(() => this.metadataManager.cycle(), this.getSettings().syncInterval),
		);
	}

	private addPostProcessors(): void {
		// In every processor we await prism to load, otherwise prism may break our rendering.
		// Luckily `await loadPrism()` is a no-op if prism is already loaded.
		// We could also load prism once on startup, but that would add 100+ms to the reported plugin load time.
		// Prism is always loaded, so the total startup time would be the same, but the higher reported time may scare users.

		// inline code blocks
		this.plugin.registerMarkdownPostProcessor((el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const codeBlocks = el.querySelectorAll('code');
			const filePath = ctx.sourcePath;

			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);

				if (codeBlock.hasClass('mb-none')) {
					continue;
				}

				const content = codeBlock.innerText;
				const fieldType = this.api.isInlineFieldDeclarationAndGetType(content);
				if (fieldType === undefined) {
					continue;
				}

				const mountable = this.api.createInlineFieldOfTypeFromString(fieldType, content, filePath, undefined);
				this.api.wrapInMDRC(mountable, codeBlock, ctx);
			}
		}, 1);

		// "meta-bind" code blocks
		this.plugin.registerMarkdownCodeBlockProcessor('meta-bind', async (source, el, ctx) => {
			await loadPrism();

			const codeBlock = el;
			const content = source.trim();
			const filePath = ctx.sourcePath;

			const fieldType = this.api.isInlineFieldDeclarationAndGetType(content);
			if (fieldType === undefined) {
				return;
			}

			const mountable = this.api.createInlineFieldOfTypeFromString(
				fieldType,
				content,
				filePath,
				undefined,
				RenderChildType.BLOCK,
				new ObsNotePosition(ctx, el),
			);
			this.api.wrapInMDRC(mountable, codeBlock, ctx);
		});

		// "meta-bind-js-view" code blocks
		this.plugin.registerMarkdownCodeBlockProcessor('meta-bind-js-view', async (source, el, ctx) => {
			await loadPrism();

			const mountable = this.api.createJsViewFieldMountable(ctx.sourcePath, {
				declaration: source,
			});

			this.api.wrapInMDRC(mountable, el, ctx);
		});

		// "meta-bind-embed" code blocks
		this.plugin.registerMarkdownCodeBlockProcessor('meta-bind-embed', async (source, el, ctx) => {
			await loadPrism();

			const mountable = this.api.createEmbedMountable(ctx.sourcePath, {
				content: source,
				depth: 0,
			});

			this.api.wrapInMDRC(mountable, el, ctx);
		});

		for (let i = 1; i <= EMBED_MAX_DEPTH; i++) {
			this.plugin.registerMarkdownCodeBlockProcessor(`meta-bind-embed-internal-${i}`, async (source, el, ctx) => {
				await loadPrism();

				const mountable = this.api.createEmbedMountable(ctx.sourcePath, {
					content: source,
					depth: i,
				});

				this.api.wrapInMDRC(mountable, el, ctx);
			});
		}

		// "meta-bind-button" code blocks
		this.plugin.registerMarkdownCodeBlockProcessor('meta-bind-button', async (source, el, ctx) => {
			await loadPrism();

			const mountable = this.api.createButtonMountable(ctx.sourcePath, {
				declaration: source,
				isPreview: false,
				position: new ObsNotePosition(ctx, el),
			});

			this.api.wrapInMDRC(mountable, el, ctx);
		});
	}

	private addCommands(): void {
		this.plugin.addCommand({
			id: 'open-docs',
			name: 'Open docs',
			callback: () => {
				window.open('https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/', '_blank');
			},
		});

		this.plugin.addCommand({
			id: 'open-playground',
			name: 'Open playground',
			callback: () => {
				void this.activateView(MB_PLAYGROUND_VIEW_TYPE);
			},
		});

		this.plugin.addCommand({
			id: 'open-help',
			name: 'Open Help',
			callback: () => {
				void this.activateView(MB_PLAYGROUND_VIEW_TYPE);
			},
		});

		this.plugin.addCommand({
			id: 'open-button-builder',
			name: 'Open button builder',
			callback: () => {
				this.internal.openButtonBuilderModal({
					onOkay: (config): void => {
						void window.navigator.clipboard.writeText(
							`\`\`\`meta-bind-button\n${stringifyYaml(config)}\n\`\`\``,
						);
					},
					submitText: 'Copy to Clipboard',
				});
			},
		});

		this.plugin.addCommand({
			// eslint-disable-next-line obsidianmd/commands/no-command-in-command-id
			id: 'copy-command-id',
			// eslint-disable-next-line obsidianmd/commands/no-command-in-command-name
			name: 'Select and copy command id',
			callback: () => {
				this.internal.openCommandSelectModal(command => {
					void window.navigator.clipboard.writeText(command.id);
				});
			},
		});
	}

	private addStatusBarBuildIndicator(): void {
		if (this.build === MetaBindBuild.DEV) {
			const item = this.plugin.addStatusBarItem();
			item.setText('Meta Bind Dev Build');
			item.addClass('mb-error');
			this.plugin.register(() => item.remove());
		}

		if (this.build === MetaBindBuild.CANARY) {
			const item = this.plugin.addStatusBarItem();
			item.setText(`Meta Bind Canary Build (${MB_VERSION})`);
			item.addClass('mb-error');
			this.plugin.register(() => item.remove());
		}
	}

	async activateView(viewType: string): Promise<void> {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null;
		const leaves = workspace.getLeavesOfType(viewType);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getLeaf('tab');
			await leaf.setViewState({ type: viewType, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		await workspace.revealLeaf(leaf);
	}

	getSettings(): MetaBindPluginSettings {
		return this.plugin.settings;
	}

	saveSettings(settings: MetaBindPluginSettings): void {
		this.plugin.settings = settings;
		void this.plugin.saveSettings();
	}
}

export default class ObsMetaBindPlugin extends Plugin {
	// @ts-expect-error TS2564
	mb: ObsMetaBind;
	// @ts-expect-error TS2564
	api: ObsAPI;
	// @ts-expect-error TS2564
	settings: MetaBindPluginSettings;

	async onload(): Promise<void> {
		console.log(`meta-bind | Main >> loading`);
		console.time('meta-bind | Main >> load-time');

		// settings
		await this.loadSettings();

		this.mb = new ObsMetaBind(this);
		this.api = this.mb.api;

		this.mb.updateInternalSettings(this.settings);

		console.timeEnd('meta-bind | Main >> load-time');
	}

	onunload(): void {
		this.mb.destroy();

		console.log(`meta-bind | Main >> unload`);
	}

	async loadSettings(): Promise<void> {
		console.log(`meta-bind | Main >> loading settings`);

		const loadedSettings = ((await this.loadData()) ?? {}) as MetaBindPluginSettings;

		if (typeof loadedSettings === 'object' && loadedSettings != null) {
			// @ts-expect-error TS2339 remove old config field
			delete loadedSettings.inputTemplates;
			// @ts-expect-error TS2339 remove old config field
			delete loadedSettings.useUsDateInputOrder;
		}

		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings);

		if (!areObjectsEqual(loadedSettings, this.settings)) {
			await this.saveSettings();
		}
	}

	async saveSettings(): Promise<void> {
		console.log(`meta-bind | Main >> settings save`);

		await this.saveData(this.settings);
	}

	async onExternalSettingsChange(): Promise<void> {
		await this.loadSettings();
		this.mb.updateInternalSettings(this.settings);
	}
}
