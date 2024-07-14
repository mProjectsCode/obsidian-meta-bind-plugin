import {
	type InputFieldArgumentConfig,
	InputFieldArgumentConfigs,
	UseLinksInputFieldArgumentValue,
} from 'packages/core/src/config/FieldConfigs';
import { AbstractInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/AbstractInputFieldArgument';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { expectType, toEnumeration } from 'packages/core/src/utils/Utils';
import { ErrorLevel, MetaBindArgumentError } from 'packages/core/src/utils/errors/MetaBindErrors';

export function applyUseLinksArgument(
	filePath: string,
	fileName: string,
	value: UseLinksInputFieldArgumentValue,
): string {
	if (value === UseLinksInputFieldArgumentValue.TRUE) {
		return `[[${filePath}|${fileName}]]`;
	} else if (value === UseLinksInputFieldArgumentValue.PARTIAL) {
		return `[[${fileName}]]`;
	} else {
		expectType<UseLinksInputFieldArgumentValue.FALSE>(value);
		return `${fileName}`;
	}
}

export class UseLinksInputFieldArgument extends AbstractInputFieldArgument {
	value: UseLinksInputFieldArgumentValue = UseLinksInputFieldArgumentValue.TRUE;

	_parseValue(value: ParsingResultNode[]): void {
		/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

		const v = value[0]?.value.toLowerCase();
		if (v === undefined) {
			this.value = UseLinksInputFieldArgumentValue.TRUE;
			return;
		}

		if (
			v === UseLinksInputFieldArgumentValue.TRUE ||
			v === UseLinksInputFieldArgumentValue.PARTIAL ||
			v === UseLinksInputFieldArgumentValue.FALSE
		) {
			this.value = v;
			return;
		}

		throw new MetaBindArgumentError({
			errorLevel: ErrorLevel.WARNING,
			effect: 'failed to set value for input field argument',
			cause: `value of argument 'useLinks' must be one of ${toEnumeration(
				[
					UseLinksInputFieldArgumentValue.TRUE,
					UseLinksInputFieldArgumentValue.PARTIAL,
					UseLinksInputFieldArgumentValue.FALSE,
				],
				x => `'${x}'`,
				', ',
				'or',
			)}`,
			docs: [DocsUtils.linkToInputFieldArgument(this.getConfig().type)],
		});
	}

	public getConfig(): InputFieldArgumentConfig {
		return InputFieldArgumentConfigs.useLinks;
	}
}
