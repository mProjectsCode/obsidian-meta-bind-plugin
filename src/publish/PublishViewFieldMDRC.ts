import { MarkdownRenderChild } from 'obsidian/publish';
import { PublishAPI } from './PublishAPI';
import { ErrorCollection } from '../utils/errors/ErrorCollection';
import { ViewFieldDeclaration } from '../parsers/ViewFieldDeclarationParser';
import * as MathJs from 'mathjs';
import { ErrorLevel, MetaBindBindTargetError, MetaBindExpressionError } from '../utils/errors/MetaBindErrors';
import { ViewFieldVariable } from '../renderChildren/ViewFieldMDRC';
import { Signal } from '../utils/Signal';
import { traverseObjectByPath } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import PublishFieldComponent from './PublishFieldComponent.svelte';
import { BindTargetDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';

export class PublishViewFieldMDRC extends MarkdownRenderChild {
	api: PublishAPI;

	uuid: string;
	filePath: string;
	metadata: Record<string, any> | undefined;

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
		metadata: Record<string, any> | undefined,
		uuid: string
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

				for (const entry of this.viewFieldDeclaration.declaration ?? []) {
					if (typeof entry !== 'string') {
						const variable: ViewFieldVariable = {
							bindTargetDeclaration: entry,
							writeSignal: new Signal<any>(undefined),
							uuid: self.crypto.randomUUID(),
							writeSignalListener: undefined,
							contextName: `MB_VAR_${varCounter}`,
							listenToChildren: false,
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

	buildContext(): Record<string, any> {
		const context: Record<string, any> = {};
		for (const variable of this.variables ?? []) {
			if (!variable.contextName || !variable.writeSignal) {
				continue;
			}

			context[variable.contextName] = variable.writeSignal.get() ?? '';
		}

		return context;
	}

	async evaluateExpression(): Promise<string> {
		if (!this.expression) {
			throw new MetaBindExpressionError(ErrorLevel.ERROR, 'failed to evaluate expression', 'expression is undefined');
		}

		const context = this.buildContext();
		try {
			return this.expression.evaluate(context);
		} catch (e: any) {
			throw new MetaBindExpressionError(ErrorLevel.ERROR, `failed to evaluate expression`, e, {
				declaration: this.viewFieldDeclaration.declaration,
				expression: this.expressionStr,
				context: context,
			});
		}
	}

	getValue(bindTarget: BindTargetDeclaration): any {
		if (bindTarget.filePath !== this.filePath) {
			throw new MetaBindBindTargetError(ErrorLevel.ERROR, 'failed to render view field', 'can not load metadata of another file in obsidian publish');
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
