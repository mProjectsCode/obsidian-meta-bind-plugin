import { MarkdownRenderChild } from 'obsidian/publish';
import { InputFieldDeclaration } from '../parsers/InputFieldDeclarationParser';
import { ErrorCollection } from '../utils/errors/ErrorCollection';
import { PublishAPI } from './PublishAPI';
import { BindTargetDeclaration } from '../parsers/BindTargetParser';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';

export class PublishInputFieldMDRC extends MarkdownRenderChild {
	api: PublishAPI;

	declaration: InputFieldDeclaration;
	bindTargetDeclaration?: BindTargetDeclaration;
	filePath: string;
	metadata: any | undefined;
	uuid: string;

	errorCollection: ErrorCollection;

	constructor(containerEl: HTMLElement, api: PublishAPI, declaration: InputFieldDeclaration, filePath: string, metadata: any | undefined, uuid: string) {
		super(containerEl);

		//console.log(this);

		this.api = api;
		this.declaration = declaration;
		this.filePath = filePath;
		this.uuid = uuid;
		this.metadata = metadata;

		this.errorCollection = new ErrorCollection(`input field ${uuid}`);
		this.errorCollection.merge(declaration.errorCollection);

		if (!this.errorCollection.hasErrors()) {
			try {
				if (this.declaration.isBound) {
					// TODO: fix bind target if file is pointing to it's own file name (not path and not empty)
					this.bindTargetDeclaration = this.api.bindTargetParser.parseBindTarget(this.declaration.bindTarget, this.filePath);
				}
			} catch (e: any) {
				this.errorCollection.add(e);
			}
		}

		this.load();
	}

	getValue(): any {
		if (this.bindTargetDeclaration) {
			return traverseObjectByPath(this.bindTargetDeclaration.metadataPath, this.metadata);
		} else {
			return undefined;
		}
	}

	onload(): void {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('meta-bind-plugin-input');
		this.containerEl.empty();

		this.errorCollection.render(this.containerEl);
		if (this.errorCollection.hasErrors()) {
			return;
		}

		const container: HTMLDivElement = createDiv();
		container.addClass('meta-bind-plugin-input-wrapper');

		container.createEl('span', { text: `${this.declaration.inputFieldType} input: ${JSON.stringify(this.getValue())}` });

		this.containerEl.appendChild(container);
	}
}
