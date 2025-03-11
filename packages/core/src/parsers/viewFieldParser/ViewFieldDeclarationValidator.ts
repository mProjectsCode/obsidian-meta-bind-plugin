import type { MetaBind } from 'packages/core/src';
import { ViewFieldArgumentType, ViewFieldType } from 'packages/core/src/config/FieldConfigs';
import type { AbstractViewFieldArgument } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/AbstractViewFieldArgument';
import { ViewFieldArgumentContainer } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/ViewFieldArgumentContainer';
import { ViewFieldArgumentFactory } from 'packages/core/src/fields/fieldArguments/viewFieldArguments/ViewFieldArgumentFactory';
import type { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { ParsingResultNode } from 'packages/core/src/parsers/nomParsers/GeneralNomParsers';
import { ParsingValidationError } from 'packages/core/src/parsers/ParsingError';
import type {
	UnvalidatedViewFieldDeclaration,
	ViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { ErrorLevel } from 'packages/core/src/utils/errors/MetaBindErrors';

export class ViewFieldDeclarationValidator {
	unvalidatedDeclaration: UnvalidatedViewFieldDeclaration;
	errorCollection: ErrorCollection;
	filePath: string;
	mb: MetaBind;

	constructor(unvalidatedDeclaration: UnvalidatedViewFieldDeclaration, filePath: string, mb: MetaBind) {
		this.unvalidatedDeclaration = unvalidatedDeclaration;
		this.mb = mb;
		this.filePath = filePath;

		this.errorCollection = new ErrorCollection('view field declaration');
	}

	public validate(scope: BindTargetScope | undefined): ViewFieldDeclaration {
		const viewFieldType = this.validateInputFieldType();
		const writeToBindTarget = this.validateBindTarget(scope);
		const argumentContainer = this.validateArguments(viewFieldType);
		const templateDeclaration = this.validateTemplateDeclaration(scope);

		const declaration: ViewFieldDeclaration = {
			declarationString: this.unvalidatedDeclaration.declarationString,
			viewFieldType: viewFieldType,
			writeToBindTarget: writeToBindTarget,
			argumentContainer: argumentContainer,
			templateDeclaration: templateDeclaration,
			errorCollection: this.errorCollection.merge(this.unvalidatedDeclaration.errorCollection),
		};

		this.checkForDeprecation(declaration);

		return declaration;
	}

	private validateInputFieldType(): ViewFieldType {
		const viewFieldType = this.unvalidatedDeclaration.viewFieldType;

		if (viewFieldType === undefined) {
			return ViewFieldType.MATH;
		}

		for (const entry of Object.entries(ViewFieldType)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
			if (entry[1] === viewFieldType?.value) {
				return entry[1];
			}
		}

		this.errorCollection.add(
			new ParsingValidationError(
				ErrorLevel.ERROR,
				'Declaration Validator',
				`Encountered invalid identifier. Expected a view field type but received '${viewFieldType.value}'.`,
				this.unvalidatedDeclaration.declarationString,
				viewFieldType.position,
			),
		);

		return ViewFieldType.INVALID;
	}

	private checkForDeprecation(_: ViewFieldDeclaration): void {}

	private validateBindTarget(scope: BindTargetScope | undefined): BindTargetDeclaration | undefined {
		if (this.unvalidatedDeclaration.writeToBindTarget !== undefined) {
			return this.mb.bindTargetParser.validate(
				this.unvalidatedDeclaration.declarationString,
				this.unvalidatedDeclaration.writeToBindTarget,
				this.filePath,
				scope,
			);
		} else {
			return undefined;
		}
	}

	private validateArguments(viewFieldType: ViewFieldType): ViewFieldArgumentContainer {
		const argumentContainer = new ViewFieldArgumentContainer();

		for (const argument of this.unvalidatedDeclaration.arguments) {
			const argumentType = this.validateArgumentType(argument.name);
			if (argumentType === ViewFieldArgumentType.INVALID) {
				continue;
			}

			const viewFieldArgument: AbstractViewFieldArgument =
				ViewFieldArgumentFactory.createViewFieldArgument(argumentType);

			if (!viewFieldArgument.isAllowed(viewFieldType)) {
				this.errorCollection.add(
					new ParsingValidationError(
						ErrorLevel.WARNING,
						'Declaration Validator',
						`Failed to parse view field arguments. Argument "${
							argument.name.value
						}" is only applicable to "${viewFieldArgument.getAllowedFieldsAsString()}" view fields.`,
						this.unvalidatedDeclaration.declarationString,
						argument.name.position,
					),
				);

				continue;
			}

			try {
				viewFieldArgument.parseValue(argument.value);
			} catch (e) {
				this.errorCollection.add(e);
				continue;
			}

			argumentContainer.add(viewFieldArgument);
		}

		try {
			argumentContainer.validate();
		} catch (e) {
			this.errorCollection.add(e);
		}

		return argumentContainer;
	}

	private validateArgumentType(argumentType: ParsingResultNode): ViewFieldArgumentType {
		for (const entry of Object.entries(ViewFieldArgumentType)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
			if (entry[1] === argumentType.value) {
				return entry[1];
			}
		}

		this.errorCollection.add(
			new ParsingValidationError(
				ErrorLevel.WARNING,
				'Declaration Validator',
				`Encountered invalid identifier. Expected a view field argument type but received '${argumentType.value}'.`,
				this.unvalidatedDeclaration.declarationString,
				argumentType.position,
			),
		);

		return ViewFieldArgumentType.INVALID;
	}

	private validateTemplateDeclaration(scope: BindTargetScope | undefined): (string | BindTargetDeclaration)[] {
		try {
			return (
				this.unvalidatedDeclaration.templateDeclaration?.map(x => {
					if (typeof x === 'string') {
						return x;
					} else {
						return this.mb.bindTargetParser.validate(
							this.unvalidatedDeclaration.declarationString,
							x,
							this.filePath,
							scope,
						);
					}
				}) ?? []
			);
		} catch (e) {
			this.errorCollection.add(e);
			return [];
		}
	}
}
