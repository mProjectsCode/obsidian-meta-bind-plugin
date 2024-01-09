import { type MarkdownPostProcessorContext, Plugin, stringifyYaml, type WorkspaceLeaf } from 'obsidian';
import { MetaBindSettingTab } from './settings/SettingsTab';
import { DateParser } from './parsers/DateParser';
import { MetadataManager } from './metadata/MetadataManager';
import { API } from './api/API';
import { setFirstWeekday } from './utils/DatePickerUtils';
import { createMarkdownRenderChildWidgetEditorPlugin } from './cm6/Cm6_ViewPlugin';
import { MDRCManager } from './MDRCManager';
import { DEFAULT_SETTINGS, type MetaBindPluginSettings } from './settings/Settings';
import { type IPlugin } from './IPlugin';
import { ObsidianMetadataAdapter } from './metadata/ObsidianMetadataAdapter';
import { FaqView, MB_FAQ_VIEW_TYPE } from './faq/FaqView';
import { EMBED_MAX_DEPTH, EmbedMDRC } from './renderChildren/EmbedMDRC';
import { getUUID } from './utils/Utils';
import { ObsidianAPIAdapter } from './api/internalApi/ObsidianAPIAdapter';
import { RenderChildType } from './config/FieldConfigs';
import { ButtonMDRC } from './renderChildren/ButtonMDRC';
import { ButtonBuilderModal } from './fields/button/ButtonBuilderModal';
import { InlineMDRCType, InlineMDRCUtils } from './utils/InlineMDRCUtils';
import { registerCm5HLModes } from './cm6/Cm5_Modes';
import { DependencyManager } from './utils/dependencies/DependencyManager';
import { Version } from './utils/dependencies/Version';
import { createEditorMenu } from './EditorMenu';

export enum MetaBindBuild {
	DEV = 'dev',
	CANARY = 'canary',
	RELEASE = 'release',
}

export default class MetaBindPlugin extends Plugin implements IPlugin {
	// @ts-expect-error TS2564
	settings: MetaBindPluginSettings;

	// @ts-expect-error TS2564
	mdrcManager: MDRCManager;

	// @ts-expect-error TS2564
	metadataManager: MetadataManager;

	// @ts-expect-error TS2564
	api: API;

	// @ts-expect-error TS2564
	internal: ObsidianAPIAdapter;

	// @ts-expect-error TS2564
	build: MetaBindBuild;

	// @ts-expect-error TS2564
	dependencyManager: DependencyManager;

	async onload(): Promise<void> {
		console.log(`meta-bind | Main >> load`);

		this.build = this.determineBuild();

		// settings
		await this.loadSettings();
		await this.saveSettings();
		this.addSettingTab(new MetaBindSettingTab(this.app, this));

		// check dependencies
		this.dependencyManager = new DependencyManager(this, [
			{
				name: 'Dataview',
				pluginId: 'dataview',
				minVersion: new Version(0, 5, 64),
			},
			{
				name: 'JS Engine',
				pluginId: 'js-engine',
				minVersion: new Version(0, 1, 0),
			},
		]);
		if (this.dependencyManager.checkDependenciesOnStartup()) {
			return;
		}

		// create all APIs and managers
		this.api = new API(this);
		this.internal = new ObsidianAPIAdapter(this);
		this.mdrcManager = new MDRCManager();
		const metadataAdapter = new ObsidianMetadataAdapter(this);
		this.metadataManager = new MetadataManager(metadataAdapter);

		this.loadTemplates();

		// register all post processors for MDRCs
		this.addPostProcessors();
		this.registerEditorExtension(createMarkdownRenderChildWidgetEditorPlugin(this));

		this.addCommands();
		registerCm5HLModes(this);

		// misc
		this.registerView(MB_FAQ_VIEW_TYPE, leaf => new FaqView(leaf, this));
		this.addStatusBarBuildIndicator();

		if (this.settings.enableEditorRightClickMenu) {
			this.registerEvent(
				this.app.workspace.on('editor-menu', (menu, editor) => {
					createEditorMenu(menu, editor, this);
				}),
			);
		}
	}

	onunload(): void {
		console.log(`meta-bind | Main >> unload`);
		this.mdrcManager.unload();
		this.metadataManager.unload();
	}

	// TODO: move to internal API
	determineBuild(): MetaBindBuild {
		if (MB_GLOBAL_CONFIG_DEV_BUILD) {
			return MetaBindBuild.DEV;
		} else if (this.manifest.version.includes('canary')) {
			return MetaBindBuild.CANARY;
		} else {
			return MetaBindBuild.RELEASE;
		}
	}

	addPostProcessors(): void {
		this.registerMarkdownPostProcessor((el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			const codeBlocks = el.querySelectorAll('code');

			for (let index = 0; index < codeBlocks.length; index++) {
				const codeBlock = codeBlocks.item(index);

				if (codeBlock.hasClass('mb-none')) {
					continue;
				}

				const content = codeBlock.innerText;

				const mdrcType = InlineMDRCUtils.isDeclarationAndGetMDRCType(content);
				if (mdrcType === undefined) {
					continue;
				}
				InlineMDRCUtils.constructMDRC(mdrcType, content, ctx.sourcePath, codeBlock, ctx, this);
			}
		}, 1);

		this.registerMarkdownCodeBlockProcessor('meta-bind', (source, el, ctx) => {
			const codeBlock = el;
			const content = source.trim();
			const mdrcType = InlineMDRCUtils.isDeclarationAndGetMDRCType(content);

			if (mdrcType === InlineMDRCType.INPUT_FIELD) {
				this.api.createInputFieldFromString(
					content,
					RenderChildType.BLOCK,
					ctx.sourcePath,
					codeBlock,
					ctx,
					undefined,
				);
			}
			if (mdrcType === InlineMDRCType.VIEW_FIELD) {
				this.api.createViewFieldFromString(content, RenderChildType.BLOCK, ctx.sourcePath, codeBlock, ctx);
			}
			if (mdrcType === InlineMDRCType.BUTTON) {
				this.api.createInlineButtonFromString(content, ctx.sourcePath, codeBlock, ctx);
			}
		});

		this.registerMarkdownCodeBlockProcessor('meta-bind-js-view', (source, el, ctx) => {
			this.api.createJsViewFieldFromString(source, RenderChildType.BLOCK, ctx.sourcePath, el, ctx);
		});

		this.registerMarkdownCodeBlockProcessor('meta-bind-embed', (source, el, ctx) => {
			const embed = new EmbedMDRC(el, source, this, ctx.sourcePath, getUUID(), 0);
			ctx.addChild(embed);
		});

		for (let i = 1; i <= EMBED_MAX_DEPTH; i++) {
			this.registerMarkdownCodeBlockProcessor(`meta-bind-embed-internal-${i}`, (source, el, ctx) => {
				const embed = new EmbedMDRC(el, source, this, ctx.sourcePath, getUUID(), i);
				ctx.addChild(embed);
			});
		}

		this.registerMarkdownCodeBlockProcessor('meta-bind-button', (source, el, ctx) => {
			const button = new ButtonMDRC(el, source, this, ctx.sourcePath, getUUID());
			ctx.addChild(button);
		});
	}

	addCommands(): void {
		this.addCommand({
			id: 'open-docs',
			name: 'Open Meta Bind Docs',
			callback: () => {
				window.open('https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/', '_blank');
			},
		});

		this.addCommand({
			id: 'open-faq',
			name: 'Open Meta Bind FAQ',
			callback: () => {
				void this.activateView(MB_FAQ_VIEW_TYPE);
			},
		});

		this.addCommand({
			id: 'open-help',
			name: 'Open Meta Bind Help',
			callback: () => {
				void this.activateView(MB_FAQ_VIEW_TYPE);
			},
		});

		this.addCommand({
			id: 'open-button-builder',
			name: 'Open Button Builder',
			callback: () => {
				new ButtonBuilderModal(
					this,
					config => {
						void window.navigator.clipboard.writeText(
							`\`\`\`meta-bind-button\n${stringifyYaml(config)}\n\`\`\``,
						);
					},
					'Copy to Clipboard',
				).open();
			},
		});
	}

	addStatusBarBuildIndicator(): void {
		if (this.build === MetaBindBuild.DEV) {
			const item = this.addStatusBarItem();
			item.setText('Meta Bind Dev Build');
			item.addClass('mb-error');
			this.register(() => item.remove());
		}

		if (this.build === MetaBindBuild.CANARY) {
			const item = this.addStatusBarItem();
			item.setText(`Meta Bind Canary Build (${this.manifest.version})`);
			item.addClass('mb-error');
			this.register(() => item.remove());
		}
	}

	loadTemplates(): void {
		const templateParseErrorCollection = this.api.inputFieldParser.parseTemplates(
			this.settings.inputFieldTemplates,
		);
		if (templateParseErrorCollection.hasErrors()) {
			console.warn('meta-bind | failed to parse templates', templateParseErrorCollection);
		}
	}

	// TODO: move to internal API
	isFilePathExcluded(path: string): boolean {
		for (const excludedFolder of this.settings.excludedFolders) {
			if (path.startsWith(excludedFolder)) {
				return true;
			}
		}

		return false;
	}

	async loadSettings(): Promise<void> {
		console.log(`meta-bind | Main >> settings load`);

		let loadedSettings = (await this.loadData()) as MetaBindPluginSettings;

		loadedSettings = this.applyTemplatesMigration(Object.assign({}, DEFAULT_SETTINGS, loadedSettings));

		this.settings = loadedSettings;

		await this.saveSettings();
	}

	async saveSettings(): Promise<void> {
		console.log(`meta-bind | Main >> settings save`);

		// update all the things
		DateParser.dateFormat = this.settings.preferredDateFormat;
		setFirstWeekday(this.settings.firstWeekday);

		await this.saveData(this.settings);
	}

	// TODO: move to internal API
	applyTemplatesMigration(oldSettings: MetaBindPluginSettings): MetaBindPluginSettings {
		return oldSettings;
	}

	// TODO: move to internal API
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
		workspace.revealLeaf(leaf);
	}
}
