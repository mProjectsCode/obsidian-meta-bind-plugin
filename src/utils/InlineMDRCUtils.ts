import { ErrorLevel, MetaBindInternalError } from './errors/MetaBindErrors';
import type MetaBindPlugin from '../main';
import { ButtonWidget, InputFieldWidget, type MarkdownRenderChildWidget, ViewFieldWidget } from '../cm6/Cm6_Widgets';
import { type AbstractMDRC } from '../renderChildren/AbstractMDRC';
import { type Component } from 'obsidian';
import { type InlineButtonMDRC } from '../renderChildren/InlineButtonMDRC';
import { RenderChildType } from '../config/FieldConfigs';
import { type ExcludedMDRC } from '../renderChildren/ExcludedMDRC';
import { type InputFieldMDRC } from '../renderChildren/InputFieldMDRC';
import { type ViewFieldMDRC } from '../renderChildren/ViewFieldMDRC';
import { type MarkdownPostProcessorContext } from 'obsidian/publish';

export class InlineMDRCUtils {
	/**
	 * Gets the prefix of a given widget type. (e.g. INPUT or VIEW)
	 *
	 * @param mdrcType
	 */
	static getDeclarationPrefix(mdrcType: InlineMDRCType): string {
		if (mdrcType === InlineMDRCType.INPUT_FIELD) {
			return 'INPUT';
		} else if (mdrcType === InlineMDRCType.VIEW_FIELD) {
			return 'VIEW';
		} else if (mdrcType === InlineMDRCType.BUTTON) {
			return 'BUTTON';
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to get declaration prefix',
			cause: `Invalid inline mdrc type "${mdrcType}"`,
		});
	}

	/**
	 * Checks if a string is a declaration of a given widget type.
	 *
	 * @param mdrcType
	 * @param str
	 */
	static isDeclaration(mdrcType: InlineMDRCType, str: string): boolean {
		const startStr: string = InlineMDRCUtils.getDeclarationPrefix(mdrcType) + '[';
		const endStr: string = ']';

		return str.startsWith(startStr) && str.endsWith(endStr);
	}

	/**
	 * Checks if a string is any declaration and if yes returns the widget type.
	 * This does not use {@link isDeclaration} because of performance reasons.
	 *
	 * @param str
	 */
	static isDeclarationAndGetMDRCType(str: string): InlineMDRCType | undefined {
		if (!str.endsWith(']')) {
			return undefined;
		}

		for (const widgetType of Object.values(InlineMDRCType)) {
			const startStr: string = InlineMDRCUtils.getDeclarationPrefix(widgetType) + '[';
			if (str.startsWith(startStr)) {
				return widgetType;
			}
		}

		return undefined;
	}

	/**
	 * Creates a MDRC widget from a given widget type.
	 *
	 * @param mdrcType
	 * @param content
	 * @param filePath
	 * @param component
	 * @param plugin
	 */
	static constructMDRCWidget(
		mdrcType: InlineMDRCType,
		content: string,
		filePath: string,
		component: Component,
		plugin: MetaBindPlugin,
	): MarkdownRenderChildWidget<AbstractMDRC> {
		if (mdrcType === InlineMDRCType.INPUT_FIELD) {
			return new InputFieldWidget(content, filePath, component, plugin);
		} else if (mdrcType === InlineMDRCType.VIEW_FIELD) {
			return new ViewFieldWidget(content, filePath, component, plugin);
		} else if (mdrcType === InlineMDRCType.BUTTON) {
			return new ButtonWidget(content, filePath, component, plugin);
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to construct mdrc',
			cause: `Invalid inline mdrc type "${mdrcType}"`,
		});
	}

	/**
	 * Creates a MDRC widget from a given widget type.
	 *
	 * @param mdrcType
	 * @param content
	 * @param filePath
	 * @param containerEl
	 * @param component
	 * @param plugin
	 */
	static constructMDRC(
		mdrcType: InlineMDRCType,
		content: string,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
		plugin: MetaBindPlugin,
	): AbstractMDRC {
		if (mdrcType === InlineMDRCType.INPUT_FIELD) {
			return InlineMDRCUtils.createInlineInputFieldMDRC(content, filePath, containerEl, component, plugin);
		} else if (mdrcType === InlineMDRCType.VIEW_FIELD) {
			return InlineMDRCUtils.createInlineViewFieldMDRC(content, filePath, containerEl, component, plugin);
		} else if (mdrcType === InlineMDRCType.BUTTON) {
			return InlineMDRCUtils.createInlineButtonMDRC(content, filePath, containerEl, component, plugin);
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to construct mdrc',
			cause: `Invalid inline mdrc type "${mdrcType}"`,
		});
	}

	static createInlineInputFieldMDRC(
		content: string,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
		plugin: MetaBindPlugin,
	): InputFieldMDRC | ExcludedMDRC {
		return plugin.api.createInputFieldFromString(content, RenderChildType.INLINE, filePath, containerEl, component);
	}

	static createInlineViewFieldMDRC(
		content: string,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
		plugin: MetaBindPlugin,
	): ViewFieldMDRC | ExcludedMDRC {
		return plugin.api.createViewFieldFromString(content, RenderChildType.INLINE, filePath, containerEl, component);
	}

	static createInlineButtonMDRC(
		content: string,
		filePath: string,
		containerEl: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
		plugin: MetaBindPlugin,
	): InlineButtonMDRC | ExcludedMDRC {
		return plugin.api.createInlineButtonFromString(content, filePath, containerEl, component);
	}
}

export enum InlineMDRCType {
	INPUT_FIELD = 'INPUT_FIELD',
	VIEW_FIELD = 'VIEW_FIELD',
	BUTTON = 'BUTTON',
}
