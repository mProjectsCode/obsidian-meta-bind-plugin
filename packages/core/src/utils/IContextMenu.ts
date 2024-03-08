export interface ContextMenuItemDefinition {
	name: string;
	icon?: string;
	warning?: boolean;
	onclick: () => void;
}

export interface IContextMenu {
	setItems(items: ContextMenuItemDefinition[]): void;

	show(x: number, y: number): void;

	showWithEvent(event: MouseEvent): void;
}
