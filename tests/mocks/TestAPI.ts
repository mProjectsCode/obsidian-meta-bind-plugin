import { IAPI } from '../../src/api/IAPI';
import { IPlugin } from '../../src/IPlugin';
import { BindTargetParser } from '../../src/parsers/BindTargetParser';
import { InputFieldAPI } from '../../src/api/InputFieldAPI';
import { InputFieldDeclarationParser } from '../../src/parsers/inputFieldParser/InputFieldParser';
import { ViewFieldParser } from '../../src/parsers/viewFieldParser/ViewFieldParser';
import { DEFAULT_SETTINGS, MetaBindPluginSettings } from '../../src/settings/Settings';
import { MetadataManager } from '../../src/metadata/MetadataManager';
import { TestAPIAdapter } from './TestAPIAdapter';
import { TestMetadataAdapter } from './TestMetadataAdapter';
import { InputFieldFactory } from '../../src/fields/inputFields/InputFieldFactory';
import { RenderChildType } from '../../src/config/FieldConfigs';
import { BindTargetScope } from '../../src/metadata/BindTargetScope';
import { InputFieldDeclaration } from '../../src/parsers/inputFieldParser/InputFieldDeclaration';
import { getUUID } from '../../src/utils/Utils';
import { TestIPFBase } from './TestIPFBase';
import { DateParser } from '../../src/parsers/DateParser';
import { setFirstWeekday } from '../../src/utils/DatePickerUtils';

export class TestPlugin implements IPlugin {
	public api: TestAPI;
	public metadataManager: MetadataManager;
	public internal: TestAPIAdapter;

	public settings: MetaBindPluginSettings;

	constructor() {
		this.api = new TestAPI(this);
		this.internal = new TestAPIAdapter(this);
		const metadataAdapter = new TestMetadataAdapter(new Map<string, Record<string, unknown>>());
		this.metadataManager = new MetadataManager(metadataAdapter);

		this.settings = DEFAULT_SETTINGS;

		DateParser.dateFormat = this.settings.preferredDateFormat;
		setFirstWeekday(this.settings.firstWeekday);
	}

	public getFilePathsByName(name: string): string[] {
		return [name];
	}
}

export class TestAPI implements IAPI {
	public readonly plugin: TestPlugin;

	public readonly bindTargetParser: BindTargetParser;
	public readonly inputFieldParser: InputFieldDeclarationParser;
	public readonly viewFieldParser: ViewFieldParser;

	public readonly inputFieldFactory: InputFieldFactory;

	public readonly inputField: InputFieldAPI;

	constructor(plugin: TestPlugin) {
		this.plugin = plugin;

		this.inputFieldParser = new InputFieldDeclarationParser(this.plugin);
		this.viewFieldParser = new ViewFieldParser(this.plugin);
		this.bindTargetParser = new BindTargetParser(this.plugin);

		this.inputFieldFactory = new InputFieldFactory(this.plugin);

		this.inputField = new InputFieldAPI(this);
	}

	public createInputFieldFromString(
		fullDeclaration: string,
		renderType: RenderChildType,
		filePath: string,
		containerEl: HTMLElement,
		scope?: BindTargetScope | undefined,
	): TestIPFBase {
		const declaration: InputFieldDeclaration = this.inputFieldParser.parseString(fullDeclaration, scope);

		return new TestIPFBase(containerEl, renderType, declaration, this.plugin, filePath, getUUID());
	}
}
