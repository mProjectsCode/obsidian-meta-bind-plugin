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
	}

	public getFilePathsByName(name: string): string[] {
		return [name];
	}
}

export class TestAPI implements IAPI {
	public readonly plugin: TestPlugin;
	public readonly inputField: InputFieldAPI;

	public readonly bindTargetParser: BindTargetParser;
	public readonly inputFieldParser: InputFieldDeclarationParser;
	public readonly viewFieldParser: ViewFieldParser;

	constructor(plugin: TestPlugin) {
		this.plugin = plugin;

		this.inputField = new InputFieldAPI(this);

		this.inputFieldParser = new InputFieldDeclarationParser(this.plugin);
		this.viewFieldParser = new ViewFieldParser(this.plugin);
		this.bindTargetParser = new BindTargetParser(this.plugin);
	}
}
