import { AbstractInputFieldArgument } from './AbstractInputFieldArgument';
import { InputFieldArgumentType } from '../parsers/InputFieldDeclarationParser';
import { MetaBindParsingError } from '../utils/MetaBindErrors';

export class InputFieldArgumentContainer {
	arguments: AbstractInputFieldArgument[] = [];

	add(argument: AbstractInputFieldArgument): void {
		this.arguments.push(argument);
	}

	validate(): void {
		let map: Record<string, number> = {};
		for (const inputFieldArgumentType of Object.values(InputFieldArgumentType)) {
			map[inputFieldArgumentType] = 0;
		}

		for (const argument of this.arguments) {
			map[argument.identifier] += 1;
			if (map[argument.identifier] > 1 && !argument.allowMultiple) {
				throw new MetaBindParsingError(`argument '${argument.identifier}' does not allow duplicates`);
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
			if (!argument.allowMultiple) {
				this.arguments = this.arguments.filter(x => x.identifier !== argument.identifier);
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
			if (!argument.allowMultiple) {
				if (this.arguments.filter(x => x.identifier === argument.identifier).length > 0) {
					throw new MetaBindParsingError('can not merge InputFieldArgumentContainers, since arguments overlap');
				}
			}
			this.arguments.push(argument);
		}

		// should not be necessary but it is better to check
		this.validate();

		return this;
	}
}
