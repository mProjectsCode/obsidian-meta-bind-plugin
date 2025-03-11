import type { API } from 'jsEngine/api/API';
import type { JsExecution } from 'jsEngine/engine/JsExecution';
import { Component } from 'obsidian';
import type { IJsRenderer } from 'packages/core/src/utils/IJsRenderer';
import { DomHelpers } from 'packages/core/src/utils/Utils';
import type { ObsMetaBind } from 'packages/obsidian/src/main';
import { getJsEnginePluginAPI } from 'packages/obsidian/src/ObsUtils';

export class ObsJsRenderer implements IJsRenderer {
	readonly mb: ObsMetaBind;
	readonly containerEl: HTMLElement;
	readonly filePath: string;
	readonly jsEngine: API;
	readonly code: string;
	readonly hidden: boolean;
	renderComponent: Component;

	constructor(mb: ObsMetaBind, containerEl: HTMLElement, filePath: string, code: string, hidden: boolean) {
		this.mb = mb;
		this.containerEl = containerEl;
		this.filePath = filePath;
		this.code = code;
		this.hidden = hidden;

		this.jsEngine = getJsEnginePluginAPI(this.mb);
		this.renderComponent = new Component();
	}

	private async evaluateCode(contextOverrides: Record<string, unknown>): Promise<JsExecution> {
		const context = await this.jsEngine.internal.getContextForMarkdownOther(this.filePath);
		return this.jsEngine.internal.execute({
			code: this.code,
			context: context,
			container: this.containerEl,
			component: this.renderComponent,
			contextOverrides: contextOverrides,
		});
	}

	async evaluate(contextOverrides: Record<string, unknown>): Promise<unknown> {
		try {
			DomHelpers.empty(this.containerEl);
			DomHelpers.removeClass(this.containerEl, 'mb-error');

			this.renderComponent.unload();
			this.renderComponent = new Component();
			this.renderComponent.load();

			const execution = await this.evaluateCode(contextOverrides);
			const renderer = this.jsEngine.internal.createRenderer(
				this.containerEl,
				this.filePath,
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
