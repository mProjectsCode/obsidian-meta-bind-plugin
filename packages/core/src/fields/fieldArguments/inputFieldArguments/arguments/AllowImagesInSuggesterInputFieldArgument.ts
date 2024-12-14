import type { InputFieldArgumentConfig } from 'packages/core/src/config/FieldConfigs';
import {
	InputFieldArgumentConfigs,
	AllowImagesInSuggesterInputFieldArgumentValue,
} from 'packages/core/src/config/FieldConfigs';
import { AbstractInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { ErrorLevel, MetaBindArgumentError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { toEnumeration } from 'packages/core/src/utils/Utils';

export class AllowImagesInSuggesterInputFieldArgument extends AbstractInputFieldArgument {
	value: AllowImagesInSuggesterInputFieldArgumentValue = AllowImagesInSuggesterInputFieldArgumentValue.TRUE;

	_parseValue(value: ParsingResultNode[]): void {
		/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

		const v = value[0]?.value.toLowerCase();
		if (v === undefined) {
			this.value = AllowImagesInSuggesterInputFieldArgumentValue.TRUE;
			return;
		}

		if (
			v === AllowImagesInSuggesterInputFieldArgumentValue.TRUE ||
			v === AllowImagesInSuggesterInputFieldArgumentValue.ONLY ||
			v === AllowImagesInSuggesterInputFieldArgumentValue.FALSE
		) {
			this.value = v;
			return;
		}

		throw new MetaBindArgumentError({
			errorLevel: ErrorLevel.WARNING,
			effect: 'failed to set value for input field argument',
			cause: `value of argument 'useLinks' must be one of ${toEnumeration(
				[
					AllowImagesInSuggesterInputFieldArgumentValue.TRUE,
					AllowImagesInSuggesterInputFieldArgumentValue.ONLY,
					AllowImagesInSuggesterInputFieldArgumentValue.FALSE,
				],
				x => `'${x}'`,
				', ',
				'or',
			)}`,
			docs: [DocsUtils.linkToInputFieldArgument(this.getConfig().type)],
		});
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.includeImages;
	}
}
