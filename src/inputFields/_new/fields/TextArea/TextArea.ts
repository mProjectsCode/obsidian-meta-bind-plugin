import { NewAbstractInputField } from '../../NewAbstractInputField';
import { InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { isLiteral } from '../../../../utils/Utils';
import { SvelteComponent } from 'svelte';
import TextAreaComponent from './TextAreaComponent.svelte';
import { InputFieldArgumentType } from '../../../InputFieldConfigs';

export class TextArea extends NewAbstractInputField<string, string> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: any): string | undefined {
		return isLiteral(value) ? value?.toString() : undefined;
	}

	protected getFallbackDefaultValue(): string {
		return '';
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		return TextAreaComponent;
	}

	protected rawReverseMapValue(value: string): string | undefined {
		return value;
	}

	protected rawMapValue(value: string): string {
		return value;
	}

	protected getMountArgs(): Record<string, any> {
		return {
			placeholder: this.renderChild.getArgument(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'Text',
		};
	}
}
