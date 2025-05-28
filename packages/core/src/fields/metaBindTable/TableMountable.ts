import type { MetaBind } from 'packages/core/src';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';
import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
import MetaBindTableComponent from 'packages/core/src/fields/metaBindTable/MetaBindTableComponent.svelte';
import { BindTargetScope } from 'packages/core/src/metadata/BindTargetScope';
import type { MetadataSubscription } from 'packages/core/src/metadata/MetadataSubscription';
import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { SimpleInputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
import type { SimpleViewFieldDeclaration } from 'packages/core/src/parsers/viewFieldParser/ViewFieldDeclaration';
import type { MBExtendedLiteral } from 'packages/core/src/utils/Literal';
import { parsePropPath } from 'packages/core/src/utils/prop/PropParser';
import { Signal } from 'packages/core/src/utils/Signal';
import { showUnloadedMessage } from 'packages/core/src/utils/Utils';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export type MetaBindColumnDeclaration = SimpleInputFieldDeclaration | SimpleViewFieldDeclaration | string;

export interface MetaBindTableRow {
	cells: FieldMountable[];
	index: number;
	value: unknown;
	isValid: boolean;
}

type TableData = Record<string, MBExtendedLiteral>[];

type TableComponent = SvelteComponent<object, { updateTable(cells: MetaBindTableRow[]): void }>;

export class TableMountable extends FieldMountable {
	bindTarget: BindTargetDeclaration;
	tableHead: string[];
	columns: MetaBindColumnDeclaration[];
	tableComponent: ReturnType<TableComponent> | undefined;

	public inputSignal: Signal<unknown>;
	private metadataSubscription?: MetadataSubscription;

	constructor(
		mb: MetaBind,
		uuid: string,
		filePath: string,
		bindTarget: BindTargetDeclaration,
		tableHead: string[],
		columns: MetaBindColumnDeclaration[],
	) {
		super(mb, uuid, filePath);
		this.bindTarget = bindTarget;
		this.tableHead = tableHead;
		this.columns = columns;

		this.inputSignal = new Signal<unknown>(undefined);
	}

	registerSelfToMetadataManager(): undefined {
		this.metadataSubscription = this.mb.metadataManager.subscribe(
			this.getUuid(),
			this.inputSignal,
			this.bindTarget,
			() => this.unmount(),
		);
	}

	unregisterSelfFromMetadataManager(): void {
		this.metadataSubscription?.unsubscribe();
	}

	updateMetadataManager(value: unknown): void {
		this.metadataSubscription?.write(value);
	}

	getValue(): TableData {
		return this.parseTableData(this.metadataSubscription?.read());
	}

	parseTableData(value: unknown): TableData {
		if (Array.isArray(value)) {
			return value as TableData;
		} else {
			return [];
		}
	}

	updateDisplayValue(values: TableData | undefined): void {
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

				const cells: FieldMountable[] = this.columns.map(x => {
					if (typeof x === 'string') {
						return this.mb.api.createInlineFieldFromString(
							x,
							this.getFilePath(),
							scope,
							RenderChildType.INLINE,
						);
					}

					if ('inputFieldType' in x) {
						return this.mb.api.createInputFieldMountable(this.getFilePath(), {
							declaration: x,
							scope: scope,
							renderChildType: RenderChildType.INLINE,
						});
					}
					if ('viewFieldType' in x) {
						return this.mb.api.createViewFieldMountable(this.getFilePath(), {
							declaration: x,
							scope: scope,
							renderChildType: RenderChildType.INLINE,
						});
					}

					throw new Error(`Unknown column type: ${JSON.stringify(x)}`);
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

		this.tableComponent?.updateTable(tableRows);
	}

	removeColumn(index: number): void {
		const value = this.getValue();
		value.splice(index, 1);
		this.updateDisplayValue(value);
		this.updateMetadataManager(value);
	}

	addColumn(): void {
		const value = this.getValue();
		value.push({});
		this.updateDisplayValue(value);
		this.updateMetadataManager(value);
	}

	protected onMount(targetEl: HTMLElement): void {
		super.onMount(targetEl);

		this.tableComponent = mount(MetaBindTableComponent as unknown as TableComponent, {
			target: targetEl,
			props: {
				table: this,
				tableHead: this.tableHead,
			},
		});

		this.inputSignal.registerListener({
			callback: value => {
				this.updateDisplayValue(this.parseTableData(value));
			},
		});

		this.registerSelfToMetadataManager();
	}

	protected onUnmount(targetEl: HTMLElement): void {
		super.onUnmount(targetEl);

		this.unregisterSelfFromMetadataManager();
		if (this.tableComponent) {
			void unmount(this.tableComponent);
		}

		showUnloadedMessage(targetEl, 'table');
	}
}
