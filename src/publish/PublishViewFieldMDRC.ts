import { MarkdownRenderChild } from 'obsidian/publish';
import { type PublishAPI } from './PublishAPI';
import { ErrorCollection } from '../utils/errors/ErrorCollection';
import * as MathJs from 'mathjs';
import { ErrorLevel, MetaBindBindTargetError, MetaBindExpressionError } from '../utils/errors/MetaBindErrors';
import { type ViewFieldVariable } from '../renderChildren/ViewFieldMDRC';
import { Signal } from '../utils/Signal';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import PublishFieldComponent from './PublishFieldComponent.svelte';
import { type BindTargetDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { type ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { getUUID } from '../utils/Utils';

export class PublishViewFieldMDRC extends MarkdownRenderChild {
	api: PublishAPI;

	uuid: string;
	filePath: string;
	metadata: Record<string, unknown> | undefined;

	viewFieldDeclaration: ViewFieldDeclaration;
	expressionStr: string;
	expression?: MathJs.EvalFunction;
	variables: ViewFieldVariable[];

	errorCollection: ErrorCollection;

	constructor(
		containerEl: HTMLElement,
		api: PublishAPI,
		declaration: ViewFieldDeclaration,
		filePath: string,
		metadata: Record<string, unknown> | undefined,
		uuid: string,
	) {
		super(containerEl);

		this.api = api;
		this.viewFieldDeclaration = declaration;
		this.filePath = filePath;
		this.uuid = uuid;
		this.metadata = metadata;
		this.expressionStr = '';
		this.variables = [];

		this.errorCollection = new ErrorCollection(`input field ${uuid}`);
		this.errorCollection.merge(declaration.errorCollection);

		if (this.errorCollection.isEmpty()) {
			try {
				let varCounter = 0;
				this.expressionStr = '';

				for (const entry of this.viewFieldDeclaration.templateDeclaration ?? []) {
					if (typeof entry !== 'string') {
						const variable: ViewFieldVariable = {
							bindTargetDeclaration: entry,
							inputSignal: new Signal<unknown>(undefined),
							uuid: getUUID(),
							contextName: `MB_VAR_${varCounter}`,
						};

						this.variables.push(variable);
						this.expressionStr += variable.contextName;
						varCounter += 1;
					} else {
						this.expressionStr += entry;
					}
				}

				this.expression = MathJs.compile(this.expressionStr);
			} catch (e) {
				this.errorCollection.add(e);
			}
		}

		this.load();
	}

	buildContext(): Record<string, unknown> {
		const context: Record<string, unknown> = {};
		for (const variable of this.variables ?? []) {
			if (!variable.contextName || !variable.inputSignal) {
				continue;
			}

			context[variable.contextName] = variable.inputSignal.get() ?? '';
		}

		return context;
	}

	async evaluateExpression(): Promise<string> {
		if (!this.expression) {
			throw new MetaBindExpressionError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to evaluate expression',
				cause: 'expression is undefined',
			});
		}

		const context = this.buildContext();
		try {
			return this.expression.evaluate(context) as Promise<string>;
		} catch (e) {
			if (e instanceof Error) {
				throw new MetaBindExpressionError({
					errorLevel: ErrorLevel.ERROR,
					effect: `failed to evaluate expression`,
					cause: e,
					context: {
						declaration: this.viewFieldDeclaration.templateDeclaration,
						expression: this.expressionStr,
						context: context,
					},
				});
			} else {
				throw new Error('encountered non thrown error that does not inherit from Error');
			}
		}
	}

	getValue(bindTarget: BindTargetDeclaration): unknown {
		if (bindTarget.filePath !== this.filePath) {
			throw new MetaBindBindTargetError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'failed to render view field',
				cause: 'can not load metadata of another file in obsidian publish',
			});
		}

		return traverseObjectByPath(bindTarget.metadataPath, this.metadata);
	}

	async onload(): Promise<void> {
		console.log('meta-bind | InputFieldMarkdownRenderChild >> load', this);

		this.containerEl.addClass('meta-bind-plugin-view');
		this.containerEl.empty();

		let value = 'placeholder';

		try {
			value = await this.evaluateExpression();
		} catch (e) {
			this.errorCollection.add(e);
		}

		new PublishFieldComponent({
			target: this.containerEl,
			props: {
				errorCollection: this.errorCollection,
				declaration: this.viewFieldDeclaration.fullDeclaration,
				value: value,
				fieldType: 'VIEW',
			},
		});
	}
}
