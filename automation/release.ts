import { UserError } from 'utils/utils';
import { CanaryVersion, Version, getIncrementOptions, parseVersion, stringifyVersion } from 'utils/versionUtils';
import config from './config.json';
import { $choice as $choice, $confirm, $seq, CMD_FMT, Verboseness } from 'utils/shellUtils';

async function runPreconditions(): Promise<void> {
	// run preconditions
	await $seq(
		[`bun run format`, `bun run lint:fix`, `bun run test`],
		(cmd: string) => {
			throw new UserError(`precondition "${cmd}" failed`);
		},
		() => {},
		undefined,
		Verboseness.VERBOSE,
	);

	// add changed files
	await $seq(
		[`git add .`],
		() => {
			throw new UserError('failed to add preconditions changes to git');
		},
		() => {},
		undefined,
		Verboseness.NORMAL,
	);

	// check if there were any changes
	let changesToCommit = false;
	await $seq(
		[`git diff --quiet`, `git diff --cached --quiet`],
		() => {
			changesToCommit = true;
		},
		() => {},
		undefined,
		Verboseness.QUITET,
	);

	// if there were any changes, commit them
	if (changesToCommit) {
		await $seq(
			[`git commit -m "[auto] run release preconditions"`],
			() => {
				throw new UserError('failed to add preconditions changes to git');
			},
			() => {},
			undefined,
			Verboseness.NORMAL,
		);
	}
}

async function run() {
	console.log('looking for untracked changes ...');

	// check for any uncommited files and exit if there are any
	await $seq(
		[`git add .`, `git diff --quiet`, `git diff --cached --quiet`, `git checkout ${config.devBranch}`],
		() => {
			throw new UserError('there are still untracked changes');
		},
		() => {},
		undefined,
		Verboseness.QUITET,
	);

	console.log('\nrunning preconditions ...\n');

	await runPreconditions();

	console.log('\nbumping versions ...\n');

	const manifestFile = Bun.file('./manifest.json');
	const manifest = await manifestFile.json();

	const versionString: string = manifest.version;
	const currentVersion: Version = parseVersion(versionString);
	const currentVersionString = stringifyVersion(currentVersion);

	const versionIncrementOptions = getIncrementOptions(currentVersion);

	const selectedIndex = await $choice(
		`Current version "${currentVersionString}". Select new version`,
		versionIncrementOptions.map(x => stringifyVersion(x)),
	);
	const newVersion = versionIncrementOptions[selectedIndex];
	const newVersionString = stringifyVersion(newVersion);

	console.log('');

	await $confirm(`Version will be updated "${currentVersionString}" -> "${newVersionString}". Are you sure`, () => {
		throw new UserError('user canceled script');
	});

	if (!(newVersion instanceof CanaryVersion)) {
		manifest.version = newVersionString;
	}

	await Bun.write(manifestFile, JSON.stringify(manifest, null, '\t'));

	const betaManifest = structuredClone(manifest);
	betaManifest.version = newVersionString;

	const betaManifestFile = Bun.file('./manifest-beta.json');
	await Bun.write(betaManifestFile, JSON.stringify(betaManifest, null, '\t'));

	if (!(newVersion instanceof CanaryVersion)) {
		const versionsFile = Bun.file('./versions.json');
		const versionsJson = await versionsFile.json();

		versionsJson[newVersionString] = manifest.minAppVersion;

		await Bun.write(versionsFile, JSON.stringify(versionsJson, null, '\t'));

		const packageFile = Bun.file('./package.json');
		const packageJson = await packageFile.json();

		packageJson.version = newVersionString;

		await Bun.write(packageFile, JSON.stringify(packageJson, null, '\t'));
	}

	await $seq(
		[`bun run format`, `git add .`, `git commit -m "[auto] bump version to \`${newVersionString}\`"`],
		() => {
			throw new UserError('failed to add preconditions changes to git');
		},
		() => {},
		undefined,
		Verboseness.NORMAL,
	);

	console.log('\ncreating release tag ...\n');

	await $seq(
		[
			`git checkout ${config.releaseBranch}`,
			`git merge ${config.devBranch} --commit -m "[auto] merge \`${newVersionString}\` release commit"`,
			`git push origin ${config.releaseBranch}`,
			`git tag -a ${newVersionString} -m "release version ${newVersionString}"`,
			`git push origin ${newVersionString}`,
			`git checkout ${config.devBranch}`,
			`git merge ${config.releaseBranch}`,
			`git push origin ${config.devBranch}`,
		],
		() => {
			throw new UserError('failed to merge or create tag');
		},
		() => {},
		undefined,
		Verboseness.NORMAL,
	);

	console.log('');

	console.log(`${CMD_FMT.BgGreen}done${CMD_FMT.Reset}`);
	console.log(`${config.github}`);
	console.log(`${config.github}/releases/tag/${newVersionString}`);
}

try {
	await run();
} catch (e) {
	if (e instanceof UserError) {
		console.error(e.message);
	} else {
		console.error(e);
	}
}
