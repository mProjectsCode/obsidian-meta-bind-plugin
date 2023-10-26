import { type App, FuzzySuggestModal } from 'obsidian';
import { type SuggesterOption } from './SuggesterHelper';
import { type MBLiteral } from '../../../../utils/Utils';

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
