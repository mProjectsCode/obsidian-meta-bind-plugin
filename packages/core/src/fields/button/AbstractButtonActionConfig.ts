import type { MetaBind } from 'packages/core/src';
import type {
	ButtonActionType,
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
} from 'packages/core/src/config/ButtonConfig';

export abstract class AbstractButtonActionConfig<T> {
	actionType: ButtonActionType;
	mb: MetaBind;

	constructor(actionType: ButtonActionType, mb: MetaBind) {
		this.actionType = actionType;
		this.mb = mb;
	}

	abstract run(
		config: ButtonConfig | undefined,
		action: T,
		filePath: string,
		context: ButtonContext,
		click: ButtonClickContext,
	): Promise<void>;

	abstract create(): Required<T>;

	abstract getActionLabel(): string;
}
