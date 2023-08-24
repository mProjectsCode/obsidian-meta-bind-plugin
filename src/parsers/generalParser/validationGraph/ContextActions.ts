export enum ContextActionType {
	POP = 'POP',
	PUSH = 'PUSH',
}

export interface ContextPopAction {
	type: ContextActionType.POP;
}

export interface ContextPushAction<Key extends string> {
	type: ContextActionType.PUSH;
	key: Key;
}

export type ContextAction<Key extends string> = ContextPopAction | ContextPushAction<Key>;
