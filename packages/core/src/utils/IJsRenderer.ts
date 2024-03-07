/**
 * A JS renderer that should be initialized with a container, a file path and a code string.
 * Every time that evaluate is called, the code string is executed and the result is returned, as well as rendered into the container.
 */
export interface IJsRenderer {
	/**
	 * The container element that the result of the evaluation should be rendered to.
	 */
	containerEl: HTMLElement;
	/**
	 * The code string that should be evaluated.
	 */
	code: string;

	/**
	 * Evaluate the code string with the given context.
	 * Should return the result of the evaluation as well as render the result to the container.
	 *
	 * @param context
	 */
	evaluate(context: Record<string, unknown>): Promise<unknown>;

	unload(): void;
}
