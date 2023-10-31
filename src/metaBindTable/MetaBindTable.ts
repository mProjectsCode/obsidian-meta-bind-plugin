import {
	type BindTargetDeclaration,
	type InputFieldDeclaration,
	type UnvalidatedInputFieldDeclaration,
} from '../parsers/inputFieldParser/InputFieldDeclaration';
import { AbstractMDRC } from '../renderChildren/AbstractMDRC';
import { InputFieldMDRC, RenderChildType } from '../renderChildren/InputFieldMDRC';
import type MetaBindPlugin from '../main';
import { BindTargetScope } from '../metadata/BindTargetScope';
import { type Listener, Signal } from '../utils/Signal';
import { getUUID, type MBExtendedLiteral } from '../utils/Utils';
import MetaBindTableComponent from './MetaBindTableComponent.svelte';
import { ViewFieldMDRC } from '../renderChildren/ViewFieldMDRC';
import { type Component } from 'obsidian';
import { type UnvalidatedViewFieldDeclaration, type ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';

import { type MetadataSubscription } from '../metadata/MetadataSubscription';

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
	}

	registerSelfToMetadataManager(): undefined {
		this.metadataManagerOutputSignalListener = this.outputSignal.registerListener({ callback: this.updateMetadataManager.bind(this) });

		this.metadataSubscription = this.plugin.metadataManager.subscribe(
			this.uuid,
			this.inputSignal,
			this.plugin.api.bindTargetParser.toFullDeclaration(this.bindTarget, this.filePath),
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

	getInitialValue(): T {
		// TODO: do type checking
		return (this.inputSignal.get() as T) ?? [];
	}

	updateDisplayValue(values: T | undefined): void {
		values = values ?? [];
		const tableRows: MetaBindTableRow[] = [];

		for (let i = 0; i < values.length; i++) {
			if (typeof values[i] === 'object') {
				const scope = new BindTargetScope({
					metadataPath: [...this.bindTarget.metadataPath, i.toString()],
					filePath: this.bindTarget.filePath,
					listenToChildren: false,
					boundToLocalScope: false,
				});

				const cells = this.columns.map(x => {
					if ('inputFieldType' in x) {
						return this.plugin.api.inputFieldParser.validateDeclaration(x, scope);
					} else {
						return this.plugin.api.viewFieldParser.validateDeclaration(x, scope);
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
			const field = new InputFieldMDRC(element, RenderChildType.INLINE, cell, this.plugin, this.filePath, `${this.uuid}/${uuid}`);
			cellComponent.addChild(field);
		} else {
			const field = new ViewFieldMDRC(element, RenderChildType.INLINE, cell, this.plugin, this.filePath, `${this.uuid}/${uuid}`);
			cellComponent.addChild(field);
		}
	}

	removeColumn(index: number): void {
		const value = (this.inputSignal.get() as T) ?? [];
		value.splice(index, 1);
		this.outputSignal.set(value);
		this.updateDisplayValue(value);
	}

	addColumn(): void {
		const value = (this.inputSignal.get() as T) ?? [];
		value.push({});
		this.outputSignal.set(value);
		this.updateDisplayValue(value);
	}

	onload(): void {
		this.registerSelfToMetadataManager();

		this.tableComponent = new MetaBindTableComponent({
			target: this.containerEl,
			props: {
				table: this,
				tableHead: this.tableHead,
			},
		});

		this.inputSignal.registerListener({
			callback: values => {
				this.updateDisplayValue(values as T);
			},
		});

		this.updateDisplayValue(this.inputSignal.get() as T);
	}

	public onunload(): void {
		this.unregisterSelfFromMetadataManager();
		this.tableComponent?.$destroy();
	}
}
