import type { MathJsInstance } from 'mathjs';
import type { API } from 'packages/core/src/api/API';
import type { FileAPI } from 'packages/core/src/api/FileAPI';
import type { InternalAPI } from 'packages/core/src/api/InternalAPI';
import { SyntaxHighlightingAPI } from 'packages/core/src/api/SyntaxHighlightingAPI';
import { ButtonActionRunner } from 'packages/core/src/fields/button/ButtonActionRunner';
import { ButtonManager } from 'packages/core/src/fields/button/ButtonManager';
import { InputFieldFactory } from 'packages/core/src/fields/inputFields/InputFieldFactory';
import { ViewFieldFactory } from 'packages/core/src/fields/viewFields/ViewFieldFactory';
import { MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import { MountableManager } from 'packages/core/src/MountableManager';
import { BindTargetParser } from 'packages/core/src/parsers/bindTargetParser/BindTargetParser';
import { ButtonParser } from 'packages/core/src/parsers/ButtonParser';
import { DateParser } from 'packages/core/src/parsers/DateParser';
import { InputFieldParser } from 'packages/core/src/parsers/inputFieldParser/InputFieldParser';
import { JsViewFieldParser } from 'packages/core/src/parsers/viewFieldParser/JsViewFieldParser';
import { ViewFieldParser } from 'packages/core/src/parsers/viewFieldParser/ViewFieldParser';
import type { MetaBindPluginSettings as MetaBindSettings } from 'packages/core/src/Settings';
import { setFirstWeekday } from 'packages/core/src/utils/DatePickerUtils';
import { createMathJS } from 'packages/core/src/utils/MathJS';

export enum MetaBindBuild {
	DEV = 'dev',
	CANARY = 'canary',
	RELEASE = 'release',
}

export interface MB_Comps {
	// API
	api: API<this>;
	internal: InternalAPI<this>;
	file: FileAPI<this>;
}

export abstract class MetaBind<Components extends MB_Comps = MB_Comps> {
	// Comps
	api!: Components['api'];
	internal!: Components['internal'];
	file!: Components['file'];

	// Parser
	inputFieldParser: InputFieldParser;
	viewFieldParser: ViewFieldParser;
	jsViewFieldParser: JsViewFieldParser;
	buttonParser: ButtonParser;
	bindTargetParser: BindTargetParser;
	// Syntax Highlighting
	syntaxHighlighting: SyntaxHighlightingAPI;
	// Factories
	inputFieldFactory: InputFieldFactory;
	viewFieldFactory: ViewFieldFactory;
	// Button
	buttonActionRunner: ButtonActionRunner;
	buttonManager: ButtonManager;
	// Managers
	metadataManager: MetadataManager;
	mountableManager: MountableManager;
	// Other
	math: MathJsInstance;
	build: MetaBindBuild;

	constructor() {
		this.inputFieldParser = new InputFieldParser(this);
		this.viewFieldParser = new ViewFieldParser(this);
		this.jsViewFieldParser = new JsViewFieldParser(this);
		this.buttonParser = new ButtonParser(this);
		this.bindTargetParser = new BindTargetParser(this);

		this.syntaxHighlighting = new SyntaxHighlightingAPI(this);

		this.inputFieldFactory = new InputFieldFactory(this);
		this.viewFieldFactory = new ViewFieldFactory(this);

		this.buttonActionRunner = new ButtonActionRunner(this);
		this.buttonManager = new ButtonManager(this);

		this.metadataManager = new MetadataManager();
		this.mountableManager = new MountableManager();

		this.math = createMathJS();
		this.build = MB_DEV_BUILD
			? MetaBindBuild.DEV
			: MB_VERSION.includes('canary')
				? MetaBindBuild.CANARY
				: MetaBindBuild.RELEASE;
	}

	setComponents(components: Components): void {
		Object.assign(this, components);
	}

	abstract getSettings(): MetaBindSettings;
	abstract saveSettings(settings: MetaBindSettings): void;

	setSettings(settings: MetaBindSettings): void {
		this.updateInternalSettings(settings);
		this.saveSettings(settings);
	}

	/**
	 * Update the settings with the given function.
	 * The function will be called with the current settings and should modify them.
	 *
	 * @param fn
	 */
	updateSettings(fn: (settings: MetaBindSettings) => void): void {
		const settings = this.getSettings();
		fn(settings);
		this.setSettings(settings);
	}

	loadTemplates(): void {
		const settings = this.getSettings();

		const inputFieldTemplateParseErrorCollection = this.inputFieldParser.parseTemplates(
			settings.inputFieldTemplates,
		);
		if (inputFieldTemplateParseErrorCollection.hasErrors()) {
			console.warn('meta-bind | failed to parse input field templates', inputFieldTemplateParseErrorCollection);
		}

		const buttonTemplateParseErrorCollection = this.buttonManager.setButtonTemplates(settings.buttonTemplates);
		if (buttonTemplateParseErrorCollection.hasErrors()) {
			console.warn('meta-bind | failed to parse button templates', buttonTemplateParseErrorCollection);
		}
	}

	updateInternalSettings(settings: MetaBindSettings): void {
		DateParser.dateFormat = settings.preferredDateFormat;
		setFirstWeekday(settings.firstWeekday);

		this.loadTemplates();
	}

	destroy(): void {
		this.mountableManager.unload();
	}
}
