import { InputFieldArgumentType, UseLinksInputFieldArgumentValue } from 'meta-bind-core/src/config/FieldConfigs';
import type { OptionInputFieldArgument } from 'meta-bind-core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import type { OptionQueryInputFieldArgument } from 'meta-bind-core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionQueryInputFieldArgument';
import type { OptionSourceInputFieldArgument } from 'meta-bind-core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionSourceInputFieldArgument';
import { applyUseLinksArgument } from 'meta-bind-core/src/fields/fieldArguments/inputFieldArguments/arguments/UseLinksInputFieldArgument';
import type { SuggesterLikeIFP } from 'meta-bind-core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { SuggesterOption } from 'meta-bind-core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import { deduplicateOptions } from 'meta-bind-core/src/fields/inputFields/optionSource/OptionSourceUtils';
import { MDLinkParser } from 'meta-bind-core/src/parsers/MarkdownLinkParser';
import type { MBLiteral } from 'meta-bind-core/src/utils/Literal';
import type { ObsMetaBind } from 'meta-bind-obsidian/src/ObsMB';
import { getDataViewPluginAPI } from 'meta-bind-obsidian/src/ObsUtils';
import { Notice } from 'obsidian';
import type { DataArray, DataviewApi, Literal } from 'obsidian-dataview';
import { z } from 'zod';

/**
 * Creates a new link string with the given alias as the display text.
 * If the input is not a link, returns it unchanged.
 */
export function createLinkWithAlias(linkStr: string, alias: string): string {
	try {
		if (MDLinkParser.isLink(linkStr)) {
			const link = MDLinkParser.parseLink(linkStr);
			link.alias = alias;
			return link.toString();
		}
	} catch (e) {
		console.warn('meta-bind | failed to create link with alias', e);
	}
	return linkStr;
}

/**
 * Builds the additional suggester options for a file's aliases (Dataview's `file.aliases`).
 *
 * - Skips aliases that are identical to the file name, since they would just duplicate the
 *   file option already added for `link` (case-sensitive but whitespace-trimmed comparison).
 * - Logs a warning instead of throwing if `aliases` is present but not an array, since Dataview
 *   does not guarantee the shape of frontmatter values.
 */
export function getAliasSuggesterOptions(
	link: string,
	dvFileName: string,
	dvFilePath: string,
	aliases: unknown,
): SuggesterOption<MBLiteral>[] {
	if (aliases === undefined || aliases === null) {
		return [];
	}

	if (!Array.isArray(aliases)) {
		console.warn(`meta-bind | expected "aliases" on "${dvFilePath}" to be an array, got "${typeof aliases}"`);
		return [];
	}

	const options: SuggesterOption<MBLiteral>[] = [];
	const normalizedFileName = dvFileName.trim();

	for (const alias of aliases) {
		if (typeof alias !== 'string') {
			continue;
		}

		const trimmedAlias = alias.trim();
		if (!trimmedAlias || trimmedAlias === normalizedFileName) {
			continue;
		}

		const linkWithAlias = createLinkWithAlias(link, trimmedAlias);
		options.push(new SuggesterOption<MBLiteral>(linkWithAlias, trimmedAlias, `alias of: ${dvFilePath}`));
	}

	return options;
}

export function getSuggesterOptions(
	mb: ObsMetaBind,
	filePath: string,
	optionArgs: OptionInputFieldArgument[],
	optionQueryArgs: OptionQueryInputFieldArgument[],
	optionSourceArgs: OptionSourceInputFieldArgument[],
	useLinks: UseLinksInputFieldArgumentValue,
): SuggesterOption<MBLiteral>[] {
	const options: SuggesterOption<MBLiteral>[] = [];

	for (const suggestOptionsArgument of optionArgs) {
		options.push(
			new SuggesterOption<MBLiteral>(suggestOptionsArgument.value, suggestOptionsArgument.name, `option`),
		);
	}

	if (optionQueryArgs.length > 0) {
		let dv: DataviewApi;
		try {
			dv = getDataViewPluginAPI(mb);
		} catch (e) {
			new Notice(
				'meta-bind | Dataview needs to be installed and enabled to use suggest option queries. Check the console for more information.',
			);
			console.warn('meta-bind | failed to get dataview api', e);

			return options;
		}

		const fileValidator = z.object({
			name: z.string().min(1),
			path: z.string().min(1),
		});

		for (const suggestOptionsQueryArgument of optionQueryArgs) {
			const result: DataArray<Record<string, Literal>> = dv.pages(suggestOptionsQueryArgument.value, filePath);

			result.forEach((file: Record<string, Literal>) => {
				try {
					const dvFile = file.file as { name: string; path: string };

					if (!fileValidator.safeParse(dvFile).success) {
						return;
					}

					const link = applyUseLinksArgument(dvFile.path, dvFile.name, useLinks);
					options.push(new SuggesterOption<MBLiteral>(link, dvFile.name, `file: ${dvFile.path}`));

					// Add aliases as additional selectable options with the alias as the link text
					options.push(...getAliasSuggesterOptions(link, dvFile.name, dvFile.path, file.aliases));
				} catch (e) {
					console.warn('meta-bind | error while computing suggest options', e);
				}
			});
		}
	}

	options.push(...mb.optionSourceResolver.resolveToSuggesterOptions(mb, optionSourceArgs, useLinks));

	return deduplicateOptions(options);
}

export function getSuggesterOptionsForInputField(
	mb: ObsMetaBind,
	inputField: SuggesterLikeIFP,
): SuggesterOption<MBLiteral>[] {
	const optionArgs = inputField.mountable.getArguments(InputFieldArgumentType.OPTION);
	const optionQueryArgs = inputField.mountable.getArguments(InputFieldArgumentType.OPTION_QUERY);
	const optionSourceArgs = inputField.mountable.getArguments(InputFieldArgumentType.OPTION_SOURCE);
	const useLinksArg = inputField.mountable.getArgument(InputFieldArgumentType.USE_LINKS);
	// in not present, we treat the use links argument as true
	return getSuggesterOptions(
		mb,
		inputField.mountable.getFilePath(),
		optionArgs,
		optionQueryArgs,
		optionSourceArgs,
		useLinksArg === undefined ? UseLinksInputFieldArgumentValue.TRUE : useLinksArg.value,
	);
}
