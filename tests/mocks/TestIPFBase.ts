import { IInputFieldBase } from '../../src/fields/inputFields/IInputFieldBase';
import { InputFieldArgumentType, RenderChildType } from '../../src/config/FieldConfigs';
import { InputFieldArgumentMapType } from '../../src/fields/fieldArguments/inputFieldArguments/InputFieldArgumentFactory';
import {
	BindTargetDeclaration,
	FullBindTarget,
	InputFieldDeclaration,
} from '../../src/parsers/inputFieldParser/InputFieldDeclaration';
import { InputField } from '../../src/fields/inputFields/InputFieldFactory';
import { TestPlugin } from './TestPlugin';

export class TestIPFBase implements IInputFieldBase {
	public readonly plugin: TestPlugin;

	filePath: string;
	uuid: string;
	renderChildType: RenderChildType;
	declaration: InputFieldDeclaration;
	containerEl: HTMLElement;

	inputField: InputField | undefined;

	constructor(
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: InputFieldDeclaration,
		plugin: TestPlugin,
		filePath: string,
		uuid: string,
	) {
		this.containerEl = containerEl;
		this.renderChildType = renderChildType;
		this.plugin = plugin;
		this.filePath = filePath;
		this.uuid = uuid;
		this.declaration = declaration;

		this.inputField = this.plugin.api.inputFieldFactory.createInputField(
			this.declaration.inputFieldType,
			this.renderChildType,
			this,
		);
	}

	public getArgument<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T> | undefined {
		return this.declaration.argumentContainer.get(name);
	}

	public getArguments<T extends InputFieldArgumentType>(name: T): InputFieldArgumentMapType<T>[] {
		return this.declaration.argumentContainer.getAll(name);
	}

	public getBindTarget(): BindTargetDeclaration | undefined {
		return this.isBound() ? this.declaration.bindTarget : undefined;
	}

	public getFilePath(): string {
		return '';
	}

	public getFullBindTarget(): FullBindTarget | undefined {
		const bindTarget = this.getBindTarget();
		if (!bindTarget) {
			return undefined;
		}

		return this.plugin.api.bindTargetParser.toFullDeclaration(bindTarget, this.filePath);
	}

	public getUuid(): string {
		return this.uuid;
	}

	public isBound(): boolean {
		return this.declaration.isBound;
	}

	public load(): void {
		this.containerEl.classList.add('mb-input');
		this.containerEl.innerHTML = '';

		const container: HTMLDivElement = document.createElement('div');
		this.containerEl.appendChild(container);
		container.classList.add('mb-input-wrapper');

		this.inputField?.mount(container);
	}

	public unload(): void {
		this.inputField?.destroy();
		this.containerEl.innerHTML = '';
	}
}
