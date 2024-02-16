import { PublishInputFieldMDRC } from './PublishInputFieldMDRC';
import { PublishViewFieldMDRC } from './PublishViewFieldMDRC';
import { type MarkdownPostProcessorContext } from 'obsidian/publish';
import { API } from '../api/API';
import { type InputFieldDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { type ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { getUUID } from '../utils/Utils';
import { type MetaBindPublishPlugin } from './Publish';

export class PublishAPI extends API<MetaBindPublishPlugin> {
	constructor(plugin: MetaBindPublishPlugin) {
		super(plugin);
	}

	public createInputFieldFromString(
		fullDeclaration: string,
		filePath: string,
		metadata: Record<string, unknown> | undefined,
		container: HTMLElement,
		component: MarkdownPostProcessorContext,
	): PublishInputFieldMDRC {
		const declaration: InputFieldDeclaration = this.inputFieldParser.parseString(
			fullDeclaration,
			filePath,
			undefined,
		);

		const inputField = new PublishInputFieldMDRC(container, this, declaration, filePath, metadata, getUUID());
		component.addChild(inputField);

		return inputField;
	}

	public createViewFieldFromString(
		fullDeclaration: string,
		filePath: string,
		metadata: Record<string, unknown> | undefined,
		container: HTMLElement,
		component: MarkdownPostProcessorContext,
	): PublishViewFieldMDRC {
		const declaration: ViewFieldDeclaration = this.viewFieldParser.parseString(fullDeclaration, filePath);

		const viewField = new PublishViewFieldMDRC(container, this, declaration, filePath, metadata, getUUID());
		component.addChild(viewField);

		return viewField;
	}
}
