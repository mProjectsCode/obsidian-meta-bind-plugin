import { Menu } from 'obsidian';
import type { ContextMenuItemDefinition, IContextMenu } from 'packages/core/src/utils/IContextMenu';

export class ObsidianContextMenu implements IContextMenu {
	menu: Menu;

	constructor() {
		this.menu = new Menu();
	}

	public setItems(items: ContextMenuItemDefinition[]): void {
		for (const item of items) {
			this.menu.addItem(menuItem => {
				menuItem.setTitle(item.name);
				if (item.icon) {
					menuItem.setIcon(item.icon);
				}
				if (item.warning) {
					menuItem.setWarning(item.warning);
				}
				menuItem.onClick(item.onclick);
			});
		}
	}

	public show(x: number, y: number): void {
		this.menu.showAtPosition({ x, y }, document);
	}

	public showWithEvent(event: MouseEvent): void {
		this.menu.showAtMouseEvent(event);
		event.stopImmediatePropagation();
		event.preventDefault();
	}
}
