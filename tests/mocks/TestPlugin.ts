import { IPlugin } from '../../src/IPlugin';
import { MetadataManager } from '../../src/metadata/MetadataManager';
import { TestAPIAdapter } from './TestAPIAdapter';
import { DEFAULT_SETTINGS, MetaBindPluginSettings } from '../../src/settings/Settings';
import { TestMetadataAdapter } from './TestMetadataAdapter';
import { DateParser } from '../../src/parsers/DateParser';
import { setFirstWeekday } from '../../src/utils/DatePickerUtils';
import { TestAPI } from './TestAPI';

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
