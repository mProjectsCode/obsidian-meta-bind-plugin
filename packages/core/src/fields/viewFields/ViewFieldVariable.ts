import type { BindTargetDeclaration } from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import type { Signal } from 'packages/core/src/utils/Signal';

export interface ViewFieldVariable {
	bindTargetDeclaration: BindTargetDeclaration;
	metadataSignal: Signal<unknown>;
	uuid: string;
	contextName: string | undefined;
}
