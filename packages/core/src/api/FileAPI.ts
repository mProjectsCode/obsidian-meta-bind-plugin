import type { LinePosition } from 'packages/core/src/config/APIConfigs';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import { ErrorLevel, MetaBindParsingError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { LineNumberContext } from 'packages/core/src/utils/LineNumberExpression';
import type { MB_Comps, MetaBind } from '..';

export abstract class FileAPI<Components extends MB_Comps> {
	readonly mb: MetaBind<Components>;

	constructor(mb: MetaBind<Components>) {
		this.mb = mb;
	}

	public abstract read(filePath: string): Promise<string>;

	public abstract write(filePath: string, content: string): Promise<void>;

	// currently not used
	// public abstract deleteFile(filePath: string): Promise<void>;

	public abstract exists(filePath: string): Promise<boolean>;

	public abstract atomicModify(filePath: string, modify: (content: string) => string): Promise<void>;

	/**
	 * Create a file in the given folder with the given name and extension.
	 * If the name is already taken, a number will be appended to the name.
	 *
	 * @param folderPath the path to the folder
	 * @param fileName the name of the file
	 * @param extension the extension of the file
	 * @param open whether to open the file
	 * @param newTab whether to open the file in a new tab or the current one
	 *
	 * @returns the path to the created file
	 */
	public abstract create(
		folderPath: string,
		fileName: string,
		extension: string,
		open?: boolean,
		newTab?: boolean,
	): Promise<string>;

	/**
	 * List all files by their path.
	 */
	public abstract getAllFiles(): string[];

	/**
	 * List all folders by their path.
	 */
	public abstract getAllFolders(): string[];

	/**
	 * Open a specific file.
	 *
	 * @param filePath
	 * @param callingFilePath
	 * @param newTab
	 */
	public abstract open(filePath: string, callingFilePath: string, newTab: boolean): Promise<void>;

	/**
	 * Resolves a file name to a file path.
	 *
	 * @param name
	 * @param relativeTo
	 */
	public abstract getPathByName(name: string, relativeTo?: string): string | undefined;

	public getFrontmatterLocation(fileContent: string): LinePosition | undefined {
		const splitContent = fileContent.split('\n');
		if (splitContent.at(0) !== '---') {
			return undefined;
		}

		for (let i = 1; i < splitContent.length; i++) {
			if (splitContent.at(i) === '---') {
				return {
					lineStart: 1,
					lineEnd: i + 1,
				};
			}
		}

		return undefined;
	}

	/**
	 * Checks if a file path has been excluded in the settings.
	 *
	 * @param filePath
	 */
	public isExcludedFromRendering(filePath: string): boolean {
		for (const excludedFolder of this.mb.getSettings().excludedFolders) {
			if (filePath.startsWith(excludedFolder)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Resolves a file name, path or link to a file path.
	 *
	 * @param filePathLike Something that is a file path or a link.
	 * @param relativeTo The file path to resolve the link relative to. This should be an actual full file path.
	 *
	 * @returns the `filePathLike` resolved to a full file path.
	 */
	public resolveFilePathLike(filePathLike: string, relativeTo?: string): string {
		const targetFilePath = MDLinkParser.isLink(filePathLike)
			? MDLinkParser.parseLink(filePathLike).target
			: filePathLike;
		const resolvedFilePath = this.mb.file.getPathByName(targetFilePath, relativeTo);
		if (resolvedFilePath === undefined) {
			throw new MetaBindParsingError({
				errorLevel: ErrorLevel.ERROR,
				cause: `Could not find a file that matches "${filePathLike}".`,
				effect: `Could not resolve path or link "${filePathLike}" relative to "${relativeTo}".`,
			});
		}

		return resolvedFilePath;
	}

	/**
	 * Get the line number context based on a file content and a self note position.
	 *
	 * @param fileContent
	 * @param selfNotePosition
	 * @returns
	 */
	public createLineNumberContext(fileContent: string, selfNotePosition: LinePosition | undefined): LineNumberContext {
		const fileStart = 1;
		const fileEnd = fileContent.split('\n').length;
		const frontmatterPosition = this.mb.file.getFrontmatterLocation(fileContent);

		return {
			fileStart: fileStart,
			fileEnd: fileEnd,
			frontmatterStart: frontmatterPosition ? frontmatterPosition.lineStart : fileStart,
			frontmatterEnd: frontmatterPosition ? frontmatterPosition.lineEnd : fileStart,
			contentStart: frontmatterPosition ? frontmatterPosition.lineEnd + 1 : fileStart,
			contentEnd: fileEnd,
			selfStart: selfNotePosition ? selfNotePosition.lineStart + 1 : undefined,
			selfEnd: selfNotePosition ? selfNotePosition.lineEnd + 1 : undefined,
		};
	}
}
