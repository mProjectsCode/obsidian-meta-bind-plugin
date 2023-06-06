import { MarkdownRenderChild } from 'obsidian';

/**
 * @deprecated
 */
export class ScriptMarkdownRenderChild extends MarkdownRenderChild {
	/*
	content: string;
	ctx: MarkdownPostProcessorContext;
	plugin: MetaBindPlugin;

	constructor(containerEl: HTMLElement, content: string, ctx: MarkdownPostProcessorContext, plugin: MetaBindPlugin) {
		super(containerEl);
		this.content = content;
		this.ctx = ctx;
		this.plugin = plugin;
	}

	async tryRun(): Promise<void> {
		if (!this.content) {
			throw new Error(`script content can not be empty for meta bind js code block`);
		}

		const isAsync = this.content.contains('await');
		const funcConstructor = isAsync ? async function (): Promise<void> {}.constructor : Function;
		const func: any = funcConstructor('app', 'mb', 'dv', 'filePath', 'ctx', this.content);
		const inlineAPI = this.plugin.api.createInlineAPI(this.ctx.sourcePath, this.containerEl);

		await Promise.resolve(func(this.plugin.app, inlineAPI, getAPI(this.plugin.app), this.ctx.sourcePath, this.ctx));
	}

	public async onload(): Promise<void> {
		try {
			await this.tryRun();
		} catch (e) {
			let m = '';
			if (e instanceof Error) {
				m = new MetaBindJsError(e.message).message;
				console.log(e.stack);
			} else {
				m = new MetaBindJsError((e as any).toString()).message;
			}

			this.containerEl.addClass('meta-bind-plugin-card');

			const preEl = this.containerEl.createEl('pre', { cls: 'language-js' });
			const codeEl = preEl.createEl('code', { text: this.content, cls: 'language-js' });

			const errorEl = this.containerEl.createEl('span', { text: m, cls: 'meta-bind-plugin-error' });
		}
	}
*/
}
