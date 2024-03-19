import all from 'obsidian/publish';

declare module 'obsidian/publish' {
	export class Notice {
		/**
		 * @public
		 */
		noticeEl: HTMLElement;
		/**
		 * @param message - The message to be displayed, can either be a simple string or a {@link DocumentFragment}
		 * @param duration - Time in milliseconds to show the notice for. If this is 0, the
		 * Notice will stay visible until the user manually dismisses it.
		 * @public
		 */
		constructor(message: string | DocumentFragment, duration?: number);
		/**
		 * Change the message of this notice.
		 * @public
		 */
		setMessage(message: string | DocumentFragment): this;
		/**
		 * @public
		 */
		hide(): void;
	}

	function setIcon(el: HTMLElement, icon: string): void;

	function parseYaml(text: string): unknown;

	function stringifyYaml(obj: unknown): string;

	interface Publish {
		site: {
			cache: {
				cache: Record<
					string,
					{
						frontmatter?: Record<string, unknown>;
					}
				>;
			};
		};
	}
}

export {};
