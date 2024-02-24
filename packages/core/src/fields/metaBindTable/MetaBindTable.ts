import MetaBindTableComponent from 'packages/core/src/fields/metaBindTable/MetaBindTableComponent.svelte';
import { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import {
	type InputFieldDeclaration,
	type UnvalidatedInputFieldDeclaration,
} from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import {
	type UnvalidatedViewFieldDeclaration,
	type ViewFieldDeclaration,
} from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import { type Listener, Signal } from 'packages/core/src/utils/Signal';

import { type IPlugin } from 'packages/core/src/IPlugin';
import { RenderChildType } from 'packages/core/src/config/FieldConfigs';
import { FieldBase } from 'packages/core/src/fields/FieldBase';
import { InputFieldBase } from 'packages/core/src/fields/inputFields/InputFieldBase';
import { ViewFieldBase } from 'packages/core/src/fields/viewFields/ViewFieldBase';
import { type MetadataSubscription } from 'packages/core/src/metadata/MetadataSubscription';
import { type BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { type MBExtendedLiteral } from 'packages/core/src/utils/Literal';
import { getUUID, showUnloadedMessage } from 'packages/core/src/utils/Utils';
import { parsePropPath } from 'packages/core/src/utils/prop/PropParser';

export type MetaBindTableCell = InputFieldDeclaration | ViewFieldDeclaration;

export type MetaBindColumnDeclaration = UnvalidatedInputFieldDeclaration | UnvalidatedViewFieldDeclaration;

export interface MetaBindTableRow {
	cells: MetaBindTableCell[];
	index: number;
	value: unknown;
	isValid: boolean;
}

type T = Record<string, MBExtendedLiteral>[];

export class MetaBindTable extends FieldBase {
	bindTarget: BindTargetDeclaration;
	tableHead: string[];
	columns: MetaBindColumnDeclaration[];
	tableComponent: MetaBindTableComponent | undefined;

	private metadataManagerOutputSignalListener: Listener<unknown> | undefined;

	/**
	 * Signal to write to the input field
	 */
	public inputSignal: Signal<unknown>;
	/**
	 * Signal to read from the input field
	 */
	public outputSignal: Signal<unknown>;

	private metadataSubscription?: MetadataSubscription;

	private value: T | undefined;

	constructor(
		plugin: IPlugin,
		uuid: string,
		filePath: string,
		bindTarget: BindTargetDeclaration,
		tableHead: string[],
		columns: MetaBindColumnDeclaration[],
	) {
		super(plugin, uuid, filePath);
		this.bindTarget = bindTarget;
		this.tableHead = tableHead;
		this.columns = columns;

		this.inputSignal = new Signal<unknown>(undefined);
		this.outputSignal = new Signal<unknown>(undefined);

		this.value = undefined;
	}

	registerSelfToMetadataManager(): undefined {
		this.metadataManagerOutputSignalListener = this.outputSignal.registerListener({
			callback: this.updateMetadataManager.bind(this),
		});

		this.metadataSubscription = this.plugin.metadataManager.subscribe(
			this.getUuid(),
			this.inputSignal,
			this.bindTarget,
			() => this.unmount(),
		);
	}

	unregisterSelfFromMetadataManager(): void {
		if (this.metadataManagerOutputSignalListener) {
			this.outputSignal.unregisterListener(this.metadataManagerOutputSignalListener);
		}

		this.metadataSubscription?.unsubscribe();
	}

	updateMetadataManager(value: unknown): void {
		this.metadataSubscription?.update(value);
	}

	updateDisplayValue(values: T | undefined): void {
		values = values ?? [];
		const tableRows: MetaBindTableRow[] = [];

		for (let i = 0; i < values.length; i++) {
			if (typeof values[i] === 'object') {
				const scope = new BindTargetScope({
					storageType: this.bindTarget.storageType,
					storageProp: this.bindTarget.storageProp.concat(parsePropPath([i.toString()])),
					storagePath: this.bindTarget.storagePath,
					listenToChildren: false,
				});

				const cells = this.columns.map(x => {
					if ('inputFieldType' in x) {
						return this.plugin.api.inputFieldParser.validate(x, this.getFilePath(), scope);
					} else {
						return this.plugin.api.viewFieldParser.validate(
							x as UnvalidatedViewFieldDeclaration,
							this.getFilePath(),
							scope,
						);
					}
				});

				tableRows.push({
					cells: cells,
					index: i,
					value: values[i],
					isValid: true,
				});
			} else {
				tableRows.push({
					cells: [],
					index: i,
					value: values[i],
					isValid: false,
				});
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		this.tableComponent?.updateTable(tableRows);
	}

	createCell(cell: MetaBindTableCell, element: HTMLElement): () => void {
		const uuid = getUUID();
		let field: FieldBase;

		if ('inputFieldType' in cell) {
			field = new InputFieldBase(this.plugin, uuid, this.getFilePath(), RenderChildType.INLINE, cell);
		} else {
			field = new ViewFieldBase(this.plugin, uuid, this.getFilePath(), RenderChildType.INLINE, cell);
		}

		field.mount(element);
		return () => field.unmount();
	}

	removeColumn(index: number): void {
		this.value = this.value ?? [];
		this.value.splice(index, 1);
		this.updateDisplayValue(this.value);
		this.outputSignal.set(this.value);
	}

	addColumn(): void {
		this.value = this.value ?? [];
		this.value.push({});
		this.updateDisplayValue(this.value);
		this.outputSignal.set(this.value);
	}

	protected onMount(targetEl: HTMLElement): void {
		this.tableComponent = new MetaBindTableComponent({
			target: targetEl,
			props: {
				table: this,
				tableHead: this.tableHead,
			},
		});

		this.inputSignal.registerListener({
			callback: values => {
				this.value = values as T;
				this.updateDisplayValue(values as T);
			},
		});

		this.registerSelfToMetadataManager();
	}

	protected onUnmount(targetEl: HTMLElement): void {
		this.unregisterSelfFromMetadataManager();
		this.tableComponent?.$destroy();

		showUnloadedMessage(targetEl, 'table');
	}
}
