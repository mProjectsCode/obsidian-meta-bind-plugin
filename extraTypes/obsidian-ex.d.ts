import { type Plugin, type PluginManifest } from 'obsidian';
import { getUUID } from '../src/utils/Utils';

declare module 'obsidian' {
	interface App {
		plugins: {
			enabledPlugins: Set<string>;
			manifests: Record<string, PluginManifest>;
			plugins: Record<string, Plugin>;
			getPlugin: (plugin: string) => Plugin;
		};

		commands: {
			/**
			 * Reference to App
			 */
			app: App;

			/**
			 * Commands *without* editor callback, will always be available in the command palette
			 * @example `app:open-vault` or `app:reload`
			 */
			commands: Record<string, Command>;
			/**
			 * Commands *with* editor callback, will only be available when editor is active and callback returns true
			 * @example `editor:fold-all` or `command-palette:open`
			 */
			editorCommands: Record<string, Command>;
			/**
			 * Add a command to the command registry
			 * @param command Command to add
			 */
			addCommand: (command: Command) => void;
			/**
			 * Execute a command by reference
			 * @param command Command to execute
			 */
			executeCommand: (command: Command) => boolean;
			/**
			 * Execute a command by ID
			 * @param commandId ID of command to execute
			 */
			executeCommandById: (commandId: string) => boolean;
			/**
			 * Find a command by ID
			 * @param commandId
			 */
			findCommand: (commandId: string) => Command | undefined;
			/**
			 * Lists **all** commands, both with and without editor callback
			 */
			listCommands: () => Command[];
			/**
			 * Remove a command from the command registry
			 * @param commandId Command to remove
			 */
			removeCommand: (commandId: string) => void;
		};
	}

	interface Menu {
		dom: HTMLElement;
		items: MenuItem[];
		onMouseOver: (evt: MouseEvent) => void;
	}

	interface MenuItem {
		callback: () => void;
		dom: HTMLElement;
		setSubmenu: () => Menu;
		disabled: boolean;
	}
}

declare global {
	const MB_GLOBAL_CONFIG_DEV_BUILD: boolean;
}

export {};
