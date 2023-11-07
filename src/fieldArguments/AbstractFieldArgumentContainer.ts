import { ErrorLevel, MetaBindArgumentError } from '../utils/errors/MetaBindErrors';
import { type FieldArgumentConfig, InputFieldArgumentType } from '../parsers/GeneralConfigs';
import { type AbstractFieldArgument } from './AbstractFieldArgument';

export abstract class AbstractFieldArgumentContainer<
	FieldType extends string,
	FieldArgumentType extends string,
	FieldConfig extends FieldArgumentConfig<FieldArgumentType, FieldType>,
> {
	arguments: AbstractFieldArgument<FieldType, FieldArgumentType, FieldConfig>[] = [];

	add(argument: AbstractFieldArgument<FieldType, FieldArgumentType, FieldConfig>): void {
		this.arguments.push(argument);
	}

	validate(): void {
		const map: Record<string, number> = {};
		for (const inputFieldArgumentType of Object.values(InputFieldArgumentType)) {
			map[inputFieldArgumentType] = 0;
		}

		for (const argument of this.arguments) {
			const argumentConfig = argument.getConfig();

			map[argumentConfig.type] += 1;
			if (map[argumentConfig.type] > 1 && !argumentConfig.allowMultiple) {
				throw new MetaBindArgumentError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'failed to validate argument container',
					cause: `argument '${argumentConfig.type}' does not allow duplicates`,
					// TODO: link to docs
				});
			}
		}
	}

	/**
	 * Merges two FieldArgumentContainers by overriding.
	 * The arguments form the other container take priority.
	 *
	 * @param other
	 */
	mergeByOverride(
		other: AbstractFieldArgumentContainer<FieldType, FieldArgumentType, FieldConfig>,
	): AbstractFieldArgumentContainer<FieldType, FieldArgumentType, FieldConfig> {
		for (const argument of other.arguments) {
			const argumentConfig = argument.getConfig();
			if (!argumentConfig.allowMultiple) {
				this.arguments = this.arguments.filter(x => x.getConfig().type !== argumentConfig.type);
			}
			this.arguments.push(argument);
		}

		// should not be necessary but it is better to check
		this.validate();

		return this;
	}

	/**
	 * Merges two FieldArgumentContainers.
	 * If there is an argument that does not allow duplicates in both containers this will throw an error.
	 *
	 * @param other
	 */
	mergeByThrow(
		other: AbstractFieldArgumentContainer<FieldType, FieldArgumentType, FieldConfig>,
	): AbstractFieldArgumentContainer<FieldType, FieldArgumentType, FieldConfig> {
		for (const argument of other.arguments) {
			const argumentConfig = argument.getConfig();
			if (!argumentConfig.allowMultiple) {
				if (this.arguments.filter(x => x.getConfig().type === argumentConfig.type).length > 0) {
					throw new MetaBindArgumentError({
						errorLevel: ErrorLevel.ERROR,
						effect: 'failed to merge argument container',
						cause: 'can not merge FieldArgumentContainers, since arguments overlap',
					});
				}
			}
			this.arguments.push(argument);
		}

		// should not be necessary but it is better to check
		this.validate();

		return this;
	}

	// TODO: every implementer needs to override this with the concrete type
	getAll(name: FieldArgumentType): AbstractFieldArgument<FieldType, FieldArgumentType, FieldConfig>[] {
		return this.arguments.filter(x => x.getConfig().type === name);
	}

	get(name: FieldArgumentType): AbstractFieldArgument<FieldType, FieldArgumentType, FieldConfig> | undefined {
		return this.getAll(name).at(0);
	}
}
