import { Plugin, TFile, TFolder } from 'obsidian';
import { Templater_RunMode } from 'packages/obsidian/src/ObsUtils';

export type TemplaterPlugin = Plugin & {
	templater: Templater;
};

export interface Templater {
	create_running_config(
		template_file: TFile | undefined,
		target_file: TFile,
		run_mode: Templater_RunMode,
	): Templater_RunningConfig;

	read_and_parse_template(config: Templater_RunningConfig): Promise<string>;

	create_new_note_from_template(
		template: TFile | string,
		folder?: TFolder,
		filename?: string,
		open_new_note?: boolean,
	): Promise<TFile | undefined>;
}

export interface Templater_RunningConfig {
	template_file: TFile | undefined;
	target_file: TFile;
	run_mode: Templater_RunMode;
	active_file?: TFile | null;
}
