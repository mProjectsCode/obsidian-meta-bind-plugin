export interface IPlugin {
	getFilePathsByName: (name: string) => string[];
}
