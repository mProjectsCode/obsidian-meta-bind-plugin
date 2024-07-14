import type {
	SuggesterLikeIFP,
	SuggesterOption,
} from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { SelectModalContent } from 'packages/core/src/modals/SelectModalContent';
import type { MBLiteral } from 'packages/core/src/utils/Literal';

export class SuggesterSelectModal extends SelectModalContent<SuggesterOption<MBLiteral>> {
	ipf: SuggesterLikeIFP;

	constructor(plugin: IPlugin, selectCallback: (value: SuggesterOption<MBLiteral>) => void, ipf: SuggesterLikeIFP) {
		super(plugin, selectCallback);
		this.ipf = ipf;
	}

	public getItemText(item: SuggesterOption<MBLiteral>): string {
		return item.displayValue;
	}

	public getItems(): SuggesterOption<MBLiteral>[] {
		return this.plugin.internal.getSuggesterOptions(this.ipf);
	}
}
