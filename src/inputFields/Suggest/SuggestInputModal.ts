import { App, FuzzySuggestModal } from 'obsidian';
import { SuggestOption } from './SuggestInputField';

export class SuggestInputModal extends FuzzySuggestModal<SuggestOption> {
	options: SuggestOption[];
	onSelect: (item: SuggestOption) => void;

	constructor(app: App, options: SuggestOption[], onSelect: (item: SuggestOption) => void) {
		super(app);
		this.options = options;
		this.onSelect = onSelect;
	}

	public getItemText(item: SuggestOption): string {
		return item.displayValue;
	}

	public getItems(): SuggestOption[] {
		return this.options;
	}

	public onChooseItem(item: SuggestOption, evt: MouseEvent | KeyboardEvent): void {
		this.onSelect(item);
	}
}
