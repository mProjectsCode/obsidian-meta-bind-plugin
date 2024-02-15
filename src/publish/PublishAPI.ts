import { ViewFieldParser } from '../parsers/viewFieldParser/ViewFieldParser';
import { BindTargetParser } from '../parsers/bindTargetParser/BindTargetParser';
import { type IPlugin } from '../IPlugin';
import { PublishInputFieldMDRC } from './PublishInputFieldMDRC';
import { PublishViewFieldMDRC } from './PublishViewFieldMDRC';
import { InputFieldDeclarationParser } from '../parsers/inputFieldParser/InputFieldParser';
import { type MarkdownPostProcessorContext } from 'obsidian/publish';
import { type IAPI } from '../api/IAPI';
import { InputFieldAPI } from '../api/InputFieldAPI';
import { type InputFieldDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { type ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { getUUID } from '../utils/Utils';
import { InputFieldFactory } from '../fields/inputFields/InputFieldFactory';
import { ButtonActionRunner } from '../fields/button/ButtonActionRunner';
import { ButtonManager } from '../fields/button/ButtonManager';
import { SyntaxHighlightingAPI } from '../api/SyntaxHighlightingAPI';
import { ViewFieldFactory } from '../fields/viewFields/ViewFieldFactory';

export class PublishAPI implements IAPI {
	public readonly plugin: IPlugin;

	public readonly inputFieldParser: InputFieldDeclarationParser;
	public readonly viewFieldParser: ViewFieldParser;
	public readonly bindTargetParser: BindTargetParser;

	public readonly inputFieldFactory: InputFieldFactory;
	public readonly viewFieldFactory: ViewFieldFactory;

	public readonly inputField: InputFieldAPI;

	public readonly buttonActionRunner: ButtonActionRunner;
	public readonly buttonManager: ButtonManager;

	public readonly syntaxHighlighting: SyntaxHighlightingAPI;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;

		this.inputFieldParser = new InputFieldDeclarationParser(this.plugin);
		this.viewFieldParser = new ViewFieldParser(this.plugin);
		this.bindTargetParser = new BindTargetParser(this.plugin);

		this.inputFieldFactory = new InputFieldFactory(this.plugin);
		this.viewFieldFactory = new ViewFieldFactory(this.plugin);

		this.inputField = new InputFieldAPI(this);

		this.buttonActionRunner = new ButtonActionRunner(this.plugin);
		this.buttonManager = new ButtonManager();

		this.syntaxHighlighting = new SyntaxHighlightingAPI(this.plugin);
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
