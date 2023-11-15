import { MarkdownRenderChild } from 'obsidian';
import { type RenderChildType } from './InputFieldMDRC';
import { ErrorCollection } from '../utils/errors/ErrorCollection';
import type MetaBindPlugin from '../main';

export class AbstractMDRC extends MarkdownRenderChild {
	plugin: MetaBindPlugin;
	/**
	 * The path of the file that this MDRC is in. This can be wrong if the file was renamed.
	 */
	filePath: string;
	uuid: string;
	renderChildType: RenderChildType;
	errorCollection: ErrorCollection;

	constructor(
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		plugin: MetaBindPlugin,
		filePath: string,
		uuid: string,
	) {
		super(containerEl);

		this.renderChildType = renderChildType;
		this.plugin = plugin;
		this.filePath = filePath;
		this.uuid = uuid;

		this.errorCollection = new ErrorCollection(this.uuid);
	}
}
