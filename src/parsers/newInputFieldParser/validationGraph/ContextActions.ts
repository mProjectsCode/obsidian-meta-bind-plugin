export enum ContextActionType {
	POP = 'POP',
	PUSH = 'PUSH',
}

export interface ContextPopAction {
	type: ContextActionType.POP;
}

export interface ContextPushAction {
	type: ContextActionType.PUSH;
	key: string;
}

export type ContextAction = ContextPopAction | ContextPushAction;
