import type { BindTargetDeclaration } from '../../parsers/bindTargetParser/BindTargetDeclaration';
import type { Signal } from '../../utils/Signal';

export interface ViewFieldVariable {
	bindTargetDeclaration: BindTargetDeclaration;
	inputSignal: Signal<unknown>;
	uuid: string;
	contextName: string | undefined;
}
