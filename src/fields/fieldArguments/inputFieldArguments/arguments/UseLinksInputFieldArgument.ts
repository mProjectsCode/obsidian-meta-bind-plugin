import { AbstractInputFieldArgument } from '../AbstractInputFieldArgument';
import { type ParsingResultNode } from '../../../../parsers/nomParsers/GeneralNomParsers';
import {
	type InputFieldArgumentConfig,
	InputFieldArgumentConfigs,
	UseLinksInputFieldArgumentValue,
} from '../../../../config/FieldConfigs';
import { ErrorLevel, MetaBindArgumentError } from '../../../../utils/errors/MetaBindErrors';
import { DocsUtils } from '../../../../utils/DocsUtils';
import { expectType, toEnumeration } from '../../../../utils/Utils';

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
