import { App, FuzzySuggestModal } from 'obsidian';
import { SuggesterOption } from './SuggesterHelper';

export class SuggesterInputModal extends FuzzySuggestModal<SuggesterOption> {
	options: SuggesterOption[];
	onSelect: (item: SuggesterOption) => void;

	constructor(app: App, options: SuggesterOption[], onSelect: (item: SuggesterOption) => void) {
		super(app);
		this.options = options;
		this.onSelect = onSelect;
	}

	public getItemText(item: SuggesterOption): string {
		return item.displayValue;
	}

	public getItems(): SuggesterOption[] {
		return this.options;
	}

	public onChooseItem(item: SuggesterOption, evt: MouseEvent | KeyboardEvent): void {
		this.onSelect(item);
	}
}
