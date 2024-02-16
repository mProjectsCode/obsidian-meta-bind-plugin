import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import type MetaBindPlugin from '../main';
import { MarkdownRenderChildWidget } from './Cm6_Widgets';
import { type Component } from 'obsidian';
import { FieldType, isFieldTypeAllowedInline } from '../api/API';

export class MDRCWidgetUtils {
	/**
	 * Gets the prefix of a given widget type. (e.g. INPUT or VIEW)
	 *
	 * @param mdrcType
	 */
	static getDeclarationPrefix(mdrcType: FieldType): string {
		if (mdrcType === FieldType.INPUT_FIELD) {
			return 'INPUT';
		} else if (mdrcType === FieldType.VIEW_FIELD) {
			return 'VIEW';
		} else if (mdrcType === FieldType.INLINE_BUTTON) {
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
	static isDeclaration(mdrcType: FieldType, str: string): boolean {
		const startStr: string = MDRCWidgetUtils.getDeclarationPrefix(mdrcType) + '[';
		const endStr: string = ']';

		return str.startsWith(startStr) && str.endsWith(endStr);
	}

	/**
	 * Checks if a string is any declaration and if yes returns the widget type.
	 * This does not use {@link isDeclaration} because of performance reasons.
	 *
	 * @param str
	 */
	static isDeclarationAndGetMDRCType(str: string): FieldType | undefined {
		if (!str.endsWith(']')) {
			return undefined;
		}

		for (const widgetType of Object.values(FieldType)) {
			if (!isFieldTypeAllowedInline(widgetType)) {
				continue;
			}
			const startStr: string = MDRCWidgetUtils.getDeclarationPrefix(widgetType) + '[';
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
		mdrcType: FieldType,
		content: string,
		filePath: string,
		component: Component,
		plugin: MetaBindPlugin,
	): MarkdownRenderChildWidget {
		if (isFieldTypeAllowedInline(mdrcType)) {
			return new MarkdownRenderChildWidget(mdrcType, content, filePath, component, plugin);
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to construct mdrc',
			cause: `Invalid inline mdrc type "${mdrcType}"`,
		});
	}
}
