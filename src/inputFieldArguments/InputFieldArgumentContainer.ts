import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { ErrorLevel, MetaBindParsingError } from '../utils/errors/MetaBindErrors';
import { InputFieldArgumentType } from '../inputFields/InputFieldConfigs';

export class InputFieldArgumentContainer {
	arguments: AbstractInputFieldArgument[] = [];

	add(argument: AbstractInputFieldArgument): void {
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
				throw new MetaBindParsingError(
					ErrorLevel.CRITICAL,
					'failed to validate argument container',
					`argument '${argumentConfig.type}' does not allow duplicates`
				);
			}
		}
	}

	/**
	 * Merges two InputFieldArgumentContainers by overriding.
	 * The arguments form the other container take priority.
	 *
	 * @param other
	 */
	mergeByOverride(other: InputFieldArgumentContainer): InputFieldArgumentContainer {
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
	 * Merges two InputFieldArgumentContainers.
	 * If there is an argument that does not allow duplicates in both containers this will throw an error.
	 *
	 * @param other
	 */
	mergeByThrow(other: InputFieldArgumentContainer): InputFieldArgumentContainer {
		for (const argument of other.arguments) {
			const argumentConfig = argument.getConfig();
			if (!argumentConfig.allowMultiple) {
				if (this.arguments.filter(x => x.getConfig().type === argumentConfig.type).length > 0) {
					throw new MetaBindParsingError(
						ErrorLevel.ERROR,
						'failed to merge argument container',
						'can not merge InputFieldArgumentContainers, since arguments overlap'
					);
				}
			}
			this.arguments.push(argument);
		}

		// should not be necessary but it is better to check
		this.validate();

		return this;
	}

	getAll(name: InputFieldArgumentType): AbstractInputFieldArgument[] {
		return this.arguments.filter(x => x.getConfig().type === name);
	}

	get(name: InputFieldArgumentType): AbstractInputFieldArgument | undefined {
		return this.getAll(name).at(0);
	}
}
