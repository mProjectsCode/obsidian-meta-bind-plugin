export interface IJsRenderer {
	evaluate(context: Record<string, unknown>): Promise<unknown>;

	unload(): void;
}
