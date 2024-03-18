import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { runParser } from 'packages/core/src/parsers/ParsingError';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { type IPlugin } from 'packages/core/src/IPlugin';
import { type ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import { V_ButtonConfig } from 'packages/core/src/config/ButtonConfigValidators';
import { ErrorLevel, MetaBindButtonError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { fromZodError } from 'zod-validation-error';

const P_ButtonGroupDeclaration = P.sequenceMap(
	(_, b) => b,
	P.string('BUTTON'),
	P.manyNotOf('[],^').separateBy(P.string(',').trim(P_UTILS.optionalWhitespace())).wrapString('[', ']'),
);

export interface ButtonGroupDeclaration {
	declarationString: string | undefined;
	referencedButtonIds: string[];
	errorCollection: ErrorCollection;
}

export interface SimpleButtonGroupDeclaration {
	referencedButtonIds: string[];
}

export interface ButtonDeclaration {
	declarationString: string | undefined;
	config: ButtonConfig | undefined;
	errorCollection: ErrorCollection;
}

export class ButtonParser {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	public fromGroupString(input: string): ButtonGroupDeclaration {
		const errorCollection = new ErrorCollection('ButtonGroup');
		let referencedButtonIds: string[] = [];

		try {
			referencedButtonIds = runParser(P_ButtonGroupDeclaration, input);
		} catch (e) {
			errorCollection.add(e);
		}
		return {
			declarationString: input,
			referencedButtonIds: referencedButtonIds,
			errorCollection: errorCollection,
		};
	}

	public validateGroup(declaration: SimpleButtonGroupDeclaration): ButtonGroupDeclaration {
		return {
			declarationString: undefined,
			referencedButtonIds: declaration.referencedButtonIds,
			errorCollection: new ErrorCollection('ButtonGroup'),
		};
	}

	public fromString(input: string): ButtonDeclaration {
		const errorCollection = new ErrorCollection('Button');
		let config: ButtonConfig | undefined = undefined;

		try {
			const parsedYaml = this.plugin.internal.parseYaml(input);
			config = this.validateConfig(parsedYaml);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			declarationString: input,
			config: config,
			errorCollection: errorCollection,
		};
	}

	public validateConfig(config: unknown): ButtonConfig {
		const parsedConfig = V_ButtonConfig.safeParse(config);

		if (!parsedConfig.success) {
			const niceError = fromZodError(parsedConfig.error, {
				unionSeparator: '\nOR ',
				issueSeparator: ' AND ',
				prefix: null,
			});

			throw new MetaBindButtonError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not parse button config',
				cause: 'zod validation failed. Check your button syntax',
				positionContext: niceError.message,
				docs: [DocsUtils.linkToButtonConfig()],
			});
		}

		return parsedConfig.data;
	}

	public validate(config: unknown): ButtonDeclaration {
		const errorCollection = new ErrorCollection('Button');
		let validatedConfig: ButtonConfig | undefined = undefined;

		try {
			validatedConfig = this.validateConfig(config);
		} catch (e) {
			errorCollection.add(e);
		}

		return {
			declarationString: undefined,
			config: validatedConfig,
			errorCollection: errorCollection,
		};
	}
}
