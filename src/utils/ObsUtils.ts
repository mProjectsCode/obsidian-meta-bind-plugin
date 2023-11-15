export function imagePathToUri(imagePath: string): string {
	// this is using the deprecated app, but it is a pain to pass the app instance through all the svelte components
	return app.vault.adapter.getResourcePath(imagePath);
}
