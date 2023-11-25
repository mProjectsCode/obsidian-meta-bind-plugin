// js engine 0.0.8 types

declare module 'jsEngine/ArgumentManager' {
	import { type CachedMetadata, type TFile } from 'obsidian';
	export interface ExecutionContext {
		file: TFile;
		metadata: CachedMetadata | null;
		line: number;
	}
	export interface ExecutionArgument {
		key: string;
		value: unknown;
	}
}
declare module 'jsEngine/Settings' {
	import { type App, PluginSettingTab } from 'obsidian';
	import type JsEnginePlugin from 'jsEngine/main';
	export interface JsEnginePluginSettings {}
	export const JS_ENGINE_DEFAULT_SETTINGS: JsEnginePluginSettings;
	export class JsEnginePluginSettingTab extends PluginSettingTab {
		plugin: JsEnginePlugin;
		constructor(app: App, plugin: JsEnginePlugin);
		display(): void;
	}
}
declare module 'jsEngine/api/markdown/MarkdownElementType' {
	export enum MarkdownElementType {
		LITERAL = 'LITERAL',
		NON_LITERAL = 'NON_LITERAL',
	}
}
declare module 'jsEngine/api/markdown/MarkdownString' {
	import { type Component } from 'obsidian';
	export class MarkdownString {
		content: string;
		constructor(content: string);
		render(element: HTMLElement, sourcePath: string, component: Component): Promise<void>;
	}
}
declare module 'jsEngine/api/markdown/AbstractMarkdownElement' {
	import { type MarkdownElementType } from 'jsEngine/api/markdown/MarkdownElementType';
	import { MarkdownString } from 'jsEngine/api/markdown/MarkdownString';
	export abstract class AbstractMarkdownElement {
		abstract toString(): string;
		abstract getType(): MarkdownElementType;
		toMarkdown(): MarkdownString;
	}
}
declare module 'jsEngine/api/markdown/AbstractMarkdownLiteral' {
	import { AbstractMarkdownElement } from 'jsEngine/api/markdown/AbstractMarkdownElement';
	import { MarkdownElementType } from 'jsEngine/api/markdown/MarkdownElementType';
	export abstract class AbstractMarkdownLiteral extends AbstractMarkdownElement {
		getType(): MarkdownElementType;
	}
}
declare module 'jsEngine/api/markdown/AbstractMarkdownElementContainer' {
	import { AbstractMarkdownElement } from 'jsEngine/api/markdown/AbstractMarkdownElement';
	import { MarkdownElementType } from 'jsEngine/api/markdown/MarkdownElementType';
	import { AbstractMarkdownLiteral } from 'jsEngine/api/markdown/AbstractMarkdownLiteral';
	export abstract class AbstractMarkdownElementContainer extends AbstractMarkdownElement {
		markdownElements: AbstractMarkdownElement[];
		constructor();
		abstract allowElement(element: AbstractMarkdownElement): boolean;
		getType(): MarkdownElementType;
		addElement(element: AbstractMarkdownElement): void;
		addText(text: string): AbstractMarkdownElementContainer;
		addBoldText(text: string): AbstractMarkdownElementContainer;
		addCursiveText(text: string): AbstractMarkdownElementContainer;
		addUnderlinedText(text: string): AbstractMarkdownElementContainer;
		addCode(text: string): AbstractMarkdownElementContainer;
		createParagraph(content: string): ParagraphElement;
		createHeading(level: number, content: string): HeadingElement;
		createBlockQuote(): BlockQuoteElement;
		createCallout(title: string, type: string, args?: string): CalloutElement;
		createCodeBlock(language: string, content: string): CodeBlockElement;
		createTable(header: string[], body: string[][]): TableElement;
	}
	export class TextElement extends AbstractMarkdownLiteral {
		content: string;
		bold: boolean;
		cursive: boolean;
		underline: boolean;
		constructor(content: string, bold: boolean, cursive: boolean, underline: boolean);
		toString(): string;
	}
	export class CodeElement extends AbstractMarkdownLiteral {
		content: string;
		constructor(content: string);
		toString(): string;
	}
	export class HeadingElement extends AbstractMarkdownElementContainer {
		level: number;
		constructor(level: number, content: string);
		toString(): string;
		allowElement(element: AbstractMarkdownElement): boolean;
	}
	export class ParagraphElement extends AbstractMarkdownElementContainer {
		constructor(content: string);
		toString(): string;
		allowElement(element: AbstractMarkdownElement): boolean;
	}
	export class CodeBlockElement extends AbstractMarkdownElementContainer {
		language: string;
		constructor(language: string, content: string);
		allowElement(element: AbstractMarkdownElement): boolean;
		toString(): string;
	}
	export class BlockQuoteElement extends AbstractMarkdownElementContainer {
		allowElement(_: AbstractMarkdownElement): boolean;
		toString(): string;
	}
	export class CalloutElement extends AbstractMarkdownElementContainer {
		title: string;
		type: string;
		args: string;
		constructor(title: string, type: string, args: string);
		allowElement(_: AbstractMarkdownElement): boolean;
		toString(): string;
	}
	export class TableElement extends AbstractMarkdownElementContainer {
		header: string[];
		body: string[][];
		constructor(header: string[], body: string[][]);
		allowElement(_: AbstractMarkdownElement): boolean;
		toString(): string;
	}
}
declare module 'jsEngine/api/markdown/MarkdownBuilder' {
	import { AbstractMarkdownElementContainer } from 'jsEngine/api/markdown/AbstractMarkdownElementContainer';
	import { type AbstractMarkdownElement } from 'jsEngine/api/markdown/AbstractMarkdownElement';
	export class MarkdownBuilder extends AbstractMarkdownElementContainer {
		constructor();
		toString(): string;
		allowElement(_: AbstractMarkdownElement): boolean;
	}
}
declare module 'jsEngine/api/MarkdownAPI' {
	import { MarkdownBuilder } from 'jsEngine/api/markdown/MarkdownBuilder';
	import { MarkdownString } from 'jsEngine/api/markdown/MarkdownString';
	import {
		BlockQuoteElement,
		CalloutElement,
		CodeBlockElement,
		CodeElement,
		HeadingElement,
		ParagraphElement,
		TableElement,
		TextElement,
	} from 'jsEngine/api/markdown/AbstractMarkdownElementContainer';
	import { type API } from 'jsEngine/api/API';
	/**
	 * The markdown API provides utilities for creating markdown using js.
	 */
	export class MarkdownAPI {
		private readonly apiInstance;
		constructor(apiInstance: API);
		/**
		 * Creates a markdown builder.
		 */
		createBuilder(): MarkdownBuilder;
		/**
		 * Creates a markdown string form a normal string.
		 * This does not modify the string.
		 * It only wraps it in an object, so that the plugin can recognize and render it as markdown.
		 *
		 * @param markdown the string to wrap
		 */
		create(markdown: string): MarkdownString;
		/**
		 * Creates a new markdown text element.
		 *
		 * @param text
		 */
		createText(text: string): TextElement;
		/**
		 * Creates a new markdown text element with bold formatting.
		 *
		 * @param text
		 */
		createBoldText(text: string): TextElement;
		/**
		 * Creates a new markdown text element with cursive formatting.
		 *
		 * @param text
		 */
		createCursiveText(text: string): TextElement;
		/**
		 * Creates a new markdown text element with underline formatting.
		 *
		 * @param text
		 */
		createUnderlinedText(text: string): TextElement;
		/**
		 * Creates a new markdown code element.
		 *
		 * @param text
		 */
		createCode(text: string): CodeElement;
		/**
		 * Creates a new markdown paragraph element.
		 *
		 * @param content
		 */
		createParagraph(content: string): ParagraphElement;
		/**
		 * Creates a new markdown heading element.
		 *
		 * @param level the level of the heading from 1 to 6
		 * @param content the text of the heading
		 */
		createHeading(level: number, content: string): HeadingElement;
		/**
		 * Creates a new markdown block quote element.
		 */
		createBlockQuote(): BlockQuoteElement;
		/**
		 * Creates a new markdown callout element.
		 *
		 * @param title the title of the callout
		 * @param type the type of the callout
		 * @param args the callout args, optional
		 */
		createCallout(title: string, type: string, args?: string): CalloutElement;
		/**
		 * Creates a new markdown code block element.
		 *
		 * @param language the language of the code block
		 * @param content the content of the code block
		 */
		createCodeBlock(language: string, content: string): CodeBlockElement;
		/**
		 * Creates a new markdown table element.
		 *
		 * @param header the header row
		 * @param body the table body
		 */
		createTable(header: string[], body: string[][]): TableElement;
	}
}
declare module 'jsEngine/api/InstanceId' {
	export enum InstanceType {
		JS_EXECUTION = 'JS_EXECUTION',
		PLUGIN = 'PLUGIN',
	}
	/**
	 * Identifies an instance of the API.
	 *
	 * For the API passed into a JsExecution this is the id of the JsExecution itself.
	 */
	export class InstanceId {
		readonly name: InstanceType | string;
		readonly id: string;
		constructor(name: InstanceType | string, id: string);
		static create(name: string): InstanceId;
	}
}
declare module 'jsEngine/messages/MessageDisplay' {
	import { type App, Modal } from 'obsidian';
	import type JsEnginePlugin from 'jsEngine/main';
	export class MessageDisplay extends Modal {
		/**
		 * Reference the JS Engine plugin.
		 */
		private readonly plugin;
		private component;
		constructor(app: App, plugin: JsEnginePlugin);
		onOpen(): void;
		onClose(): void;
	}
}
declare module 'jsEngine/utils/StoreObj' {
	import { type Subscriber, type Unsubscriber, type Writable } from 'svelte/store';
	export type Store<T> = Writable<T> & {
		get(): T;
		notify(): void;
	};
	export function store<T>(value: T): Store<T>;
	type Invalidator<T> = (value?: T) => void;
	export class StoreObj<T> implements Store<T> {
		private value;
		private subscriberCounter;
		private subscribers;
		constructor(value: T);
		set(newValue: T): void;
		update(fn: (origValue: T) => T): void;
		get(): T;
		subscribe(run: Subscriber<T>, _?: Invalidator<T>): Unsubscriber;
		notify(): void;
	}
}
declare module 'jsEngine/Util' {
	export function iteratorToArray<T>(iterator: Iterable<T>): T[];
}
declare module 'jsEngine/messages/MessageManager' {
	import { type App } from 'obsidian';
	import type JsEnginePlugin from 'jsEngine/main';
	import { type Store } from 'jsEngine/utils/StoreObj';
	import type { Moment } from 'moment';
	import { type InstanceId } from 'jsEngine/api/InstanceId';
	export enum MessageType {
		INFO = 'info',
		TIP = 'tip',
		SUCCESS = 'success',
		WANING = 'warning',
		ERROR = 'error',
	}
	export const messageTypeOrder: MessageType[];
	export function mapMessageTypeToClass(messageType: MessageType): string;
	export function mapMessageTypeToIcon(messageType: MessageType): string;
	export function mapMessageTypeToMessageIndicatorClass(messageType: MessageType): string;
	export class Message {
		type: MessageType;
		title: string;
		content: string;
		code: string;
		constructor(type: MessageType, title: string, content: string, code: string);
	}
	export class MessageWrapper {
		uuid: string;
		source: InstanceId;
		message: Message;
		time: Moment;
		constructor(message: Message, source: InstanceId);
	}
	export class MessageManager {
		/**
		 * Reference to the obsidian app.
		 */
		private readonly app;
		/**
		 * Reference the JS Engine plugin.
		 */
		private readonly plugin;
		messages: Store<Map<string, MessageWrapper>>;
		statusBarItem: HTMLElement | undefined;
		private messageDisplay;
		constructor(app: App, plugin: JsEnginePlugin);
		initStatusBarItem(): void;
		addMessage(message: Message, source: InstanceId): MessageWrapper;
		removeMessage(id: string): void;
		private updateStatusBarItem;
		getMessagesFromSource(source: InstanceId): MessageWrapper[];
	}
}
declare module 'jsEngine/api/MessageAPI' {
	import { type API } from 'jsEngine/api/API';
	import { type MessageManager, type MessageType, type MessageWrapper } from 'jsEngine/messages/MessageManager';
	export class MessageAPI {
		readonly apiInstance: API;
		readonly messageManager: MessageManager;
		constructor(apiInstance: API);
		createMessage(type: MessageType, title: string, content: string, code?: string): MessageWrapper;
		getMessageById(id: string): MessageWrapper | undefined;
		getMessagesForInstance(): MessageWrapper[];
	}
}
declare module 'jsEngine/ResultRenderer' {
	import { type Component } from 'obsidian';
	import type JsEnginePlugin from 'jsEngine/main';
	export class ResultRenderer {
		readonly plugin: JsEnginePlugin;
		readonly container: HTMLElement;
		readonly sourcePath: string;
		readonly component: Component;
		constructor(plugin: JsEnginePlugin, container: HTMLElement, sourcePath: string, component: Component);
		render(content: unknown): Promise<void>;
	}
}
declare module 'jsEngine/engine/JsExecution' {
	import { type App, type Component } from 'obsidian';
	import type JsEnginePlugin from 'jsEngine/main';
	import { type ExecutionArgument, type ExecutionContext } from 'jsEngine/ArgumentManager';
	import { type MessageWrapper } from 'jsEngine/messages/MessageManager';
	import { API } from 'jsEngine/api/API';
	export type JsFunc = (...args: unknown[]) => Promise<unknown>;
	export interface JsExecutionParams {
		app: App;
		plugin: JsEnginePlugin;
		code: string;
		component: Component;
		container?: HTMLElement | undefined;
		context?: ExecutionContext | undefined;
		contextOverrides?: Record<string, unknown> | undefined;
	}
	export class JsExecution {
		readonly app: App;
		readonly plugin: JsEnginePlugin;
		uuid: string;
		code: string;
		args: ExecutionArgument[];
		context: ExecutionContext & Record<string, unknown>;
		apiInstance: API;
		messages: MessageWrapper[];
		func: JsFunc | undefined;
		result: unknown;
		functionBuildError: Error | undefined;
		functionRunError: Error | undefined;
		functionBuildTime: number | undefined;
		functionRunTime: number | undefined;
		constructor(params: JsExecutionParams);
		buildFunction(): void;
		runFunction(): Promise<void>;
		isSuccessful(): boolean;
		getMessages(): MessageWrapper[];
		openStatsModal(): void;
	}
}
declare module 'jsEngine/api/reactive/ReactiveComponent' {
	import { type ResultRenderer } from 'jsEngine/ResultRenderer';
	import { type JsFunc } from 'jsEngine/engine/JsExecution';
	export class ReactiveComponent {
		readonly _render: JsFunc;
		readonly initialArgs: unknown[];
		renderer: ResultRenderer | undefined;
		constructor(_render: JsFunc, initialArgs: unknown[]);
		refresh(...args: unknown[]): Promise<void>;
		initialRender(): void;
		setRenderer(renderer: ResultRenderer): void;
	}
}
declare module 'jsEngine/api/LibAPI' {
	import { type API } from 'jsEngine/api/API';
	import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
	import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
	import { Parser } from '@lemons_dev/parsinom/lib/Parser';
	import { createParsingErrorMessage, ParsingError } from '@lemons_dev/parsinom/lib/ParserError';
	import { ParserContext } from '@lemons_dev/parsinom/lib/ParserContext';
	export interface LibParsiNOM {
		P: typeof P;
		P_UTILS: typeof P_UTILS;
		Parser: typeof Parser;
		createParsingErrorMessage: typeof createParsingErrorMessage;
		ParsingError: typeof ParsingError;
		ParserContext: typeof ParserContext;
	}
	/**
	 * The lib API provides in interface to some external libraries packaged into js engine.
	 */
	export class LibAPI {
		private readonly apiInstance;
		constructor(apiInstance: API);
		parsinom(): LibParsiNOM;
		itertools(): any;
	}
}
declare module 'jsEngine/engine/ExecutionStatsModal' {
	import { type App, Modal } from 'obsidian';
	import type JsEnginePlugin from 'jsEngine/main';
	import { type JsExecution } from 'jsEngine/engine/JsExecution';
	export class ExecutionStatsModal extends Modal {
		private readonly plugin;
		private component;
		private execution;
		constructor(app: App, plugin: JsEnginePlugin);
		setExecution(execution: JsExecution): void;
		onOpen(): void;
		onClose(): void;
	}
}
declare module 'jsEngine/engine/Engine' {
	import type JsEnginePlugin from 'jsEngine/main';
	import { type App } from 'obsidian';
	import { JsExecution, type JsExecutionParams } from 'jsEngine/engine/JsExecution';
	export type EngineExecutionParams = Omit<JsExecutionParams, 'app' | 'plugin'>;
	export class Engine {
		private readonly app;
		private readonly plugin;
		private executionStatsModal;
		activeExecutions: Map<string, JsExecution>;
		constructor(app: App, plugin: JsEnginePlugin);
		execute(params: EngineExecutionParams): Promise<JsExecution>;
		openExecutionStatsModal(jsExecution: JsExecution): void;
	}
}
declare module 'jsEngine/api/Internal' {
	import { type API } from 'jsEngine/api/API';
	import { type EngineExecutionParams } from 'jsEngine/engine/Engine';
	import { type JsExecution } from 'jsEngine/engine/JsExecution';
	import { type Component } from 'obsidian';
	import { ResultRenderer } from 'jsEngine/ResultRenderer';
	/**
	 * The internal API provides access to some of js engines internals.
	 */
	export class InternalAPI {
		private readonly apiInstance;
		constructor(apiInstance: API);
		execute(params: EngineExecutionParams): Promise<JsExecution>;
		createRenderer(container: HTMLElement, sourcePath: string, component: Component): ResultRenderer;
		executeFile(path: string, params: Omit<EngineExecutionParams, 'code'>): Promise<JsExecution>;
	}
}
declare module 'jsEngine/api/API' {
	import { MarkdownAPI } from 'jsEngine/api/MarkdownAPI';
	import { type App, type Plugin } from 'obsidian';
	import type JsEnginePlugin from 'jsEngine/main';
	import { type InstanceId } from 'jsEngine/api/InstanceId';
	import { MessageAPI } from 'jsEngine/api/MessageAPI';
	import { ReactiveComponent } from 'jsEngine/api/reactive/ReactiveComponent';
	import { LibAPI } from 'jsEngine/api/LibAPI';
	import { type JsFunc } from 'jsEngine/engine/JsExecution';
	import { InternalAPI } from 'jsEngine/api/Internal';
	export class API {
		/**
		 * Reference to the obsidian app.
		 */
		readonly app: App;
		/**
		 * Reference the JS Engine plugin.
		 */
		readonly plugin: JsEnginePlugin;
		readonly instanceId: InstanceId;
		/**
		 * API to interact with markdown.
		 */
		readonly markdown: MarkdownAPI;
		/**
		 * API to interact with the plugins message system.
		 */
		readonly message: MessageAPI;
		/**
		 * API to interact with packaged libraries.
		 */
		readonly lib: LibAPI;
		/**
		 * API to interact with js engines internals.
		 */
		readonly internal: InternalAPI;
		constructor(app: App, plugin: JsEnginePlugin, instanceId: InstanceId);
		/**
		 * Loads an ECMAScript module from a vault relative path.
		 *
		 * @param path the vault relative path of the file to import
		 */
		importJs(path: string): Promise<any>;
		/**
		 * Gets a plugin by its id. A plugin id can be found by looking at its manifest.
		 *
		 * @param pluginId the id of the plugin.
		 */
		getPlugin(pluginId: string): Plugin;
		reactive(fn: JsFunc, ...initialArgs: unknown[]): ReactiveComponent;
	}
}
declare module 'jsEngine/main' {
	import { type App, Plugin, type PluginManifest } from 'obsidian';
	import { type JsEnginePluginSettings } from 'jsEngine/Settings';
	import { API } from 'jsEngine/api/API';
	import { MessageManager } from 'jsEngine/messages/MessageManager';
	import { Engine } from 'jsEngine/engine/Engine';
	export default class JsEnginePlugin extends Plugin {
		settings: JsEnginePluginSettings | undefined;
		messageManager: MessageManager;
		jsEngine: Engine;
		api: API;
		constructor(app: App, manifest: PluginManifest);
		onload(): Promise<void>;
		onunload(): void;
		loadSettings(): Promise<void>;
		saveSettings(): Promise<void>;
		/**
		 * Inspired by https://github.com/SilentVoid13/Templater/blob/487805b5ad1fd7fbc145040ed82b4c41fc2c48e2/src/editor/Editor.ts#L67
		 */
		registerCodeMirrorMode(): Promise<void>;
	}
}
declare module 'jsEngine/JsMDRC' {
	import { type MarkdownPostProcessorContext, MarkdownRenderChild, TFile } from 'obsidian';
	import type JsEnginePlugin from 'jsEngine/main';
	import { type ExecutionContext } from 'jsEngine/ArgumentManager';
	import { type JsExecution } from 'jsEngine/engine/JsExecution';
	export class JsMDRC extends MarkdownRenderChild {
		plugin: JsEnginePlugin;
		content: string;
		ctx: MarkdownPostProcessorContext;
		jsExecution: JsExecution | undefined;
		constructor(
			containerEl: HTMLElement,
			plugin: JsEnginePlugin,
			content: string,
			ctx: MarkdownPostProcessorContext,
		);
		getExecutionFile(): TFile | undefined;
		buildExecutionContext(): ExecutionContext;
		tryRun(context: ExecutionContext): Promise<JsExecution>;
		renderResults(container: HTMLElement): Promise<void>;
		renderExecutionStats(container: HTMLElement): void;
		render(): Promise<void>;
		onload(): Promise<void>;
		onunload(): void;
	}
}
