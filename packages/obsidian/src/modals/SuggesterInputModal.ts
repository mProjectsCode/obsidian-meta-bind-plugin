import { type App, FuzzySuggestModal } from 'obsidian';
import { type SuggesterOption } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';

import { type MBLiteral } from 'packages/core/src/utils/Literal';

export class SuggesterInputModal extends FuzzySuggestModal<SuggesterOption<MBLiteral>> {
	options: SuggesterOption<MBLiteral>[];
	onSelect: (item: SuggesterOption<MBLiteral>) => void;

	constructor(app: App, options: SuggesterOption<MBLiteral>[], onSelect: (item: SuggesterOption<MBLiteral>) => void) {
		super(app);
		this.options = options;
		this.onSelect = onSelect;
	}

	public getItemText(item: SuggesterOption<MBLiteral>): string {
		return item.displayValue;
	}

	public getItems(): SuggesterOption<MBLiteral>[] {
		return this.options;
	}

	public onChooseItem(item: SuggesterOption<MBLiteral>, _: MouseEvent | KeyboardEvent): void {
		this.onSelect(item);
	}
}
