import {
	type InputFieldDeclaration,
	type UnvalidatedInputFieldDeclaration,
} from '../../parsers/inputFieldParser/InputFieldDeclaration';
import { AbstractMDRC } from '../../renderChildren/AbstractMDRC';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';
import type MetaBindPlugin from '../../main';
import { BindTargetScope } from '../../metadata/BindTargetScope';
import { type Listener, Signal } from '../../utils/Signal';
import { getUUID } from '../../utils/Utils';
import MetaBindTableComponent from './MetaBindTableComponent.svelte';
import { ViewFieldMDRC } from '../../renderChildren/ViewFieldMDRC';
import { type Component } from 'obsidian';
import {
	type UnvalidatedViewFieldDeclaration,
	type ViewFieldDeclaration,
} from '../../parsers/viewFieldParser/ViewFieldDeclaration';

import { type MetadataSubscription } from '../../metadata/MetadataSubscription';
import { type MBExtendedLiteral } from '../../utils/Literal';
import { parsePropPath } from '../../utils/prop/PropParser';
import { RenderChildType } from '../../config/FieldConfigs';
import { type BindTargetDeclaration } from '../../parsers/bindTargetParser/BindTargetDeclaration';

export type MetaBindTableCell = InputFieldDeclaration | ViewFieldDeclaration;

export type MetaBindColumnDeclaration = UnvalidatedInputFieldDeclaration | UnvalidatedViewFieldDeclaration;

export interface MetaBindTableRow {
	cells: MetaBindTableCell[];
	index: number;
	value: unknown;
	isValid: boolean;
}

type T = Record<string, MBExtendedLiteral>[];

export class MetaBindTable extends AbstractMDRC {
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
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		plugin: MetaBindPlugin,
		filePath: string,
		uuid: string,
		bindTarget: BindTargetDeclaration,
		tableHead: string[],
		columns: MetaBindColumnDeclaration[],
	) {
		super(containerEl, renderChildType, plugin, filePath, uuid);
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
			this.uuid,
			this.inputSignal,
			this.bindTarget,
			() => this.unload(),
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
						// console.log('validate', x, this.filePath, scope);
						return this.plugin.api.inputFieldParser.validateDeclaration(x, this.filePath, scope);
					} else {
						return this.plugin.api.viewFieldParser.validateDeclaration(x, this.filePath, scope);
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

	createCell(cell: MetaBindTableCell, element: HTMLElement, cellComponent: Component): void {
		const uuid = getUUID();
		if ('inputFieldType' in cell) {
			const field = new InputFieldMDRC(
				element,
				RenderChildType.INLINE,
				cell,
				this.plugin,
				this.filePath,
				`${this.uuid}/${uuid}`,
			);
			cellComponent.addChild(field);
		} else {
			const field = new ViewFieldMDRC(
				element,
				RenderChildType.INLINE,
				cell,
				this.plugin,
				this.filePath,
				`${this.uuid}/${uuid}`,
			);
			cellComponent.addChild(field);
		}
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

	onload(): void {
		this.plugin.mdrcManager.registerMDRC(this);

		this.tableComponent = new MetaBindTableComponent({
			target: this.containerEl,
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

	public onunload(): void {
		this.plugin.mdrcManager.unregisterMDRC(this);
		this.unregisterSelfFromMetadataManager();
		this.tableComponent?.$destroy();
	}
}
