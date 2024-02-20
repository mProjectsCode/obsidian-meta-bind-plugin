import { IPlugin } from '../../packages/core/src/IPlugin';
import { TestInternalAPI } from './TestInternalAPI';
import { DEFAULT_SETTINGS, MetaBindPluginSettings } from '../../packages/core/src/Settings';
import { TestAPI } from './TestAPI';
import { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import { DateParser } from '../../packages/core/src/parsers/DateParser';
import { setFirstWeekday } from '../../packages/core/src/utils/DatePickerUtils';
import { BindTargetStorageType } from '../../packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import {
	GlobalMetadataSource,
	InternalMetadataSource,
	ScopeMetadataSource,
} from '../../packages/core/src/metadata/InternalMetadataSources';

export class TestPlugin implements IPlugin {
	public api: TestAPI;
	public metadataManager: MetadataManager;
	public internal: TestInternalAPI;

	public settings: MetaBindPluginSettings;

	constructor() {
		this.api = new TestAPI(this);
		this.internal = new TestInternalAPI(this);
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
	}
}
