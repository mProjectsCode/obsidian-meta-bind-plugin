import { MarkdownRenderChild } from 'obsidian';
import MetaBindPlugin from '../main';
import { RenderChildType } from './InputFieldMDRC';

export class AbstractMDRC extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	filePath: string;
	uuid: string;
	error: string;
	renderChildType: RenderChildType;

	constructor(containerEl: HTMLElement, renderChildType: RenderChildType, plugin: MetaBindPlugin, filePath: string, uuid: string) {
		super(containerEl);

		this.renderChildType = renderChildType;
		this.plugin = plugin;
		this.filePath = filePath;
		this.uuid = uuid;

		this.error = '';
	}
}
