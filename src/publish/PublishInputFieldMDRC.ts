import { MarkdownRenderChild } from 'obsidian/publish';
import { getPublishDefaultValue, InputFieldDeclaration } from '../parsers/InputFieldDeclarationParser';
import { ErrorCollection } from '../utils/errors/ErrorCollection';
import { PublishAPI } from './PublishAPI';
import { BindTargetDeclaration } from '../parsers/BindTargetParser';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { ErrorLevel, MetaBindBindTargetError } from '../utils/errors/MetaBindErrors';
import PublishFieldComponent from './PublishFieldComponent.svelte';

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
		if (!this.bindTargetDeclaration) {
			this.errorCollection.add(new MetaBindBindTargetError(ErrorLevel.WARNING, 'populated with default data', 'input field not bound'));
			return getPublishDefaultValue(this.declaration);
		}

		if (this.bindTargetDeclaration.filePath !== this.filePath) {
			this.errorCollection.add(
				new MetaBindBindTargetError(ErrorLevel.WARNING, 'populated with default data', 'can not load metadata of another file in obsidian publish')
			);
			return getPublishDefaultValue(this.declaration);
		}

		const value = traverseObjectByPath(this.bindTargetDeclaration.metadataPath, this.metadata);

		if (!value) {
			this.errorCollection.add(new MetaBindBindTargetError(ErrorLevel.WARNING, 'populated with default data', 'value in metadata is undefined'));
			return getPublishDefaultValue(this.declaration);
		}

		return value;
	}

	onload(): void {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('meta-bind-plugin-input');
		this.containerEl.empty();

		const value = this.getValue().toString();

		new PublishFieldComponent({
			target: this.containerEl,
			props: {
				errorCollection: this.errorCollection,
				declaration: this.declaration.fullDeclaration,
				value: value,
				fieldType: 'INPUT',
			},
		});
	}
}
