import { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { type IPlugin } from '../../IPlugin';
import { type UnvalidatedViewFieldDeclaration, type ViewFieldDeclaration } from './ViewFieldDeclaration';
import { type BindTargetScope } from '../../metadata/BindTargetScope';
import { type BindTargetDeclaration } from '../inputFieldParser/InputFieldDeclaration';
import { ParsingValidationError } from '../ParsingError';
import { ErrorLevel } from '../../utils/errors/MetaBindErrors';
import { type ParsingResultNode } from '../nomParsers/GeneralParsers';
import { ViewFieldArgumentContainer } from '../../fieldArguments/viewFieldArguments/ViewFieldArgumentContainer';
import { ViewFieldArgumentFactory } from '../../fieldArguments/viewFieldArguments/ViewFieldArgumentFactory';
import { type AbstractViewFieldArgument } from '../../fieldArguments/viewFieldArguments/AbstractViewFieldArgument';
import { ViewFieldArgumentType, ViewFieldType } from '../GeneralConfigs';

export class ViewFieldDeclarationValidator {
	unvalidatedDeclaration: UnvalidatedViewFieldDeclaration;
	errorCollection: ErrorCollection;
	plugin: IPlugin;

	constructor(unvalidatedDeclaration: UnvalidatedViewFieldDeclaration, plugin: IPlugin) {
		this.unvalidatedDeclaration = unvalidatedDeclaration;
		this.plugin = plugin;

		this.errorCollection = new ErrorCollection('view field declaration');
	}

	public validate(scope: BindTargetScope | undefined): ViewFieldDeclaration {
		const viewFieldType = this.validateInputFieldType();
		const writeToBindTarget = this.validateBindTarget(scope);
		const argumentContainer = this.validateArguments(viewFieldType);
		const templateDeclaration = this.validateTemplateDeclaration(scope);

		const declaration: ViewFieldDeclaration = {
			fullDeclaration: this.unvalidatedDeclaration.fullDeclaration,
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
				`Encountered invalid identifier. Expected token to be a view field type but received '${viewFieldType.value}'.`,
				this.unvalidatedDeclaration.fullDeclaration,
				viewFieldType.position,
			),
		);

		return ViewFieldType.INVALID;
	}

	private checkForDeprecation(_: ViewFieldDeclaration): void {}

	private validateBindTarget(scope: BindTargetScope | undefined): BindTargetDeclaration | undefined {
		if (this.unvalidatedDeclaration.writeToBindTarget !== undefined) {
			return this.plugin.api.bindTargetParser.validateBindTarget(
				this.unvalidatedDeclaration.fullDeclaration,
				this.unvalidatedDeclaration.writeToBindTarget,
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

			const viewFieldArgument: AbstractViewFieldArgument = ViewFieldArgumentFactory.createViewFieldArgument(argumentType);

			if (!viewFieldArgument.isAllowed(viewFieldType)) {
				this.errorCollection.add(
					new ParsingValidationError(
						ErrorLevel.WARNING,
						'Declaration Validator',
						`Failed to parse view field arguments. Argument "${
							argument.name.value
						}" is only applicable to "${viewFieldArgument.getAllowedFieldsAsString()}" view fields.`,
						this.unvalidatedDeclaration.fullDeclaration,
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
				`Encountered invalid identifier. Expected identifier to be a view field argument type but received '${argumentType.value}'.`,
				this.unvalidatedDeclaration.fullDeclaration,
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
						return this.plugin.api.bindTargetParser.validateBindTarget(this.unvalidatedDeclaration.fullDeclaration, x, scope);
					}
				}) ?? []
			);
		} catch (e) {
			this.errorCollection.add(e);
			return [];
		}
	}
}
