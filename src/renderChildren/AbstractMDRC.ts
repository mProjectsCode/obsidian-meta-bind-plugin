import { MarkdownRenderChild } from 'obsidian';
import { RenderChildType } from './InputFieldMDRC';
import { ErrorCollection } from '../utils/errors/ErrorCollection';
import MetaBindPlugin from '../main';

export class AbstractMDRC extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	filePath: string;
	uuid: string;
	renderChildType: RenderChildType;
	frontmatter: any | null | undefined;
	errorCollection: ErrorCollection;

	constructor(containerEl: HTMLElement, renderChildType: RenderChildType, plugin: MetaBindPlugin, filePath: string, uuid: string, frontmatter: any | null | undefined) {
		super(containerEl);

		this.renderChildType = renderChildType;
		this.plugin = plugin;
		this.filePath = filePath;
		this.uuid = uuid;
		this.frontmatter = frontmatter;

		this.errorCollection = new ErrorCollection(this.uuid);
	}
}
