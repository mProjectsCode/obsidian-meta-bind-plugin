import type { API } from 'jsEngine/api/API';
import type { JsExecution } from 'jsEngine/engine/JsExecution';
import { Component, TFile } from 'obsidian';
import type { IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import { DomHelpers } from 'packages/core/src/utils/Utils';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import { getJsEnginePluginAPI } from 'packages/obsidian/src/ObsUtils';

export class ObsidianJsRenderer implements IJsRenderer {
	readonly plugin: MetaBindPlugin;
	containerEl: HTMLElement;
	file: TFile;
	jsEngine: API;
	code: string;
	hidden: boolean;
	renderComponent: Component;

	constructor(plugin: MetaBindPlugin, containerEl: HTMLElement, filePath: string, code: string, hidden: boolean) {
		this.plugin = plugin;
		this.containerEl = containerEl;
		this.code = code;
		this.hidden = hidden;

		const file = plugin.app.vault.getAbstractFileByPath(filePath);
		if (!(file instanceof TFile)) {
			throw new Error(`File not found: ${filePath}`);
		}
		this.file = file;

		this.jsEngine = getJsEnginePluginAPI(this.plugin);
		this.renderComponent = new Component();
	}

	private async evaluateCode(context: Record<string, unknown>): Promise<JsExecution> {
		return this.jsEngine.internal.execute({
			code: this.code,
			context: {
				file: this.file,
				line: 0,
				metadata: this.plugin.app.metadataCache.getFileCache(this.file),
			},
			container: this.containerEl,
			component: this.renderComponent,
			contextOverrides: context,
		});
	}

	async evaluate(context: Record<string, unknown>): Promise<unknown> {
		try {
			DomHelpers.empty(this.containerEl);
			DomHelpers.removeClass(this.containerEl, 'mb-error');

			this.renderComponent.unload();
			this.renderComponent = new Component();
			this.renderComponent.load();

			const execution = await this.evaluateCode(context);
			const renderer = this.jsEngine.internal.createRenderer(
				this.containerEl,
				this.file.path,
				this.renderComponent,
			);
			if (!this.hidden) {
				await renderer.render(execution.result);
			}

			return renderer.convertToSimpleObject(execution.result);
		} catch (e) {
			if (e instanceof Error) {
				this.containerEl.innerText = e.message;
				DomHelpers.addClass(this.containerEl, 'mb-error');
			}

			return undefined;
		}
	}

	unload(): void {
		this.renderComponent.unload();
	}
}
