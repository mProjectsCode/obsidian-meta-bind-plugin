import { IPlugin } from '../../src/IPlugin';
import { MetadataManager } from '../../src/metadata/MetadataManager';
import { TestAPIAdapter } from './TestAPIAdapter';
import { DEFAULT_SETTINGS, MetaBindPluginSettings } from '../../src/settings/Settings';
import { DateParser } from '../../src/parsers/DateParser';
import { setFirstWeekday } from '../../src/utils/DatePickerUtils';
import { TestAPI } from './TestAPI';
import {
	GlobalMetadataSource,
	InternalMetadataSource,
	ScopeMetadataSource,
} from '../../src/metadata/InternalMetadataSources';
import { BindTargetStorageType } from '../../src/parsers/bindTargetParser/BindTargetDeclaration';

export class TestPlugin implements IPlugin {
	public api: TestAPI;
	public metadataManager: MetadataManager;
	public internal: TestAPIAdapter;

	public settings: MetaBindPluginSettings;

	constructor() {
		this.api = new TestAPI(this);
		this.internal = new TestAPIAdapter(this);
		this.metadataManager = new MetadataManager();
		this.setUpMetadataManager();

		this.settings = DEFAULT_SETTINGS;

		DateParser.dateFormat = this.settings.preferredDateFormat;
		setFirstWeekday(this.settings.firstWeekday);
	}

	setUpMetadataManager(): void {
		this.metadataManager.registerSource(
			new InternalMetadataSource(BindTargetStorageType.FRONTMATTER, this.metadataManager),
		);

		this.metadataManager.registerSource(
			new InternalMetadataSource(BindTargetStorageType.MEMORY, this.metadataManager),
		);

		this.metadataManager.registerSource(
			new GlobalMetadataSource(BindTargetStorageType.GLOBAL_MEMORY, this.metadataManager),
		);

		this.metadataManager.registerSource(new ScopeMetadataSource(BindTargetStorageType.SCOPE, this.metadataManager));

		this.metadataManager.setDefaultSource(BindTargetStorageType.FRONTMATTER);

		// window.setInterval(() => this.metadataManager.cycle(), this.settings.syncInterval);
	}

	public getFilePathsByName(name: string): string[] {
		return [name];
	}
}
