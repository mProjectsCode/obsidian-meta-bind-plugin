import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import { V_ButtonConfig } from 'packages/core/src/config/validators/ButtonConfigValidators';
import type { MetaBind } from 'packages/core/src/index';
import { runParser } from 'packages/core/src/parsers/ParsingError';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { ErrorLevel, MetaBindButtonError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { toReadableError, validate } from 'packages/core/src/utils/ZodUtils';

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
	mb: MetaBind;

	constructor(mb: MetaBind) {
		this.mb = mb;
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
			const parsedYaml = this.mb.internal.parseYaml(input);
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
		const parsedConfig = validate(V_ButtonConfig, config);

		if (!parsedConfig.success) {
			const niceError = toReadableError(parsedConfig.error);

			throw new MetaBindButtonError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'The validation for the button config failed.',
				cause: 'Your button syntax seems to be invalid. Check that your button config follows what is described in the docs.',
				positionContext: niceError,
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
