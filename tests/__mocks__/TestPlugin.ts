import { IPlugin } from '../../src/IPlugin';
import { MetadataManager } from '../../src/metadata/MetadataManager';
import { TestAPIAdapter } from './TestAPIAdapter';
import { DEFAULT_SETTINGS, MetaBindPluginSettings } from '../../src/settings/Settings';
import { DateParser } from '../../src/parsers/DateParser';
import { setFirstWeekday } from '../../src/utils/DatePickerUtils';
import { TestAPI } from './TestAPI';
import { GlobalMetadataSource, InternalMetadataSource } from '../../src/metadata/InternalMetadataSources';
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
		const obsidianMetadataSource = new InternalMetadataSource(
			BindTargetStorageType.FRONTMATTER,
			this.metadataManager,
		);
		this.metadataManager.registerSource(obsidianMetadataSource);

		const memoryMetadataSource = new InternalMetadataSource(BindTargetStorageType.MEMORY, this.metadataManager);
		this.metadataManager.registerSource(memoryMetadataSource);

		const globalMemoryMetadataSource = new GlobalMetadataSource(
			BindTargetStorageType.GLOBAL_MEMORY,
			this.metadataManager,
		);
		this.metadataManager.registerSource(globalMemoryMetadataSource);

		// window.setInterval(() => this.metadataManager.cycle(), this.settings.syncInterval);
	}

	public getFilePathsByName(name: string): string[] {
		return [name];
	}
}
