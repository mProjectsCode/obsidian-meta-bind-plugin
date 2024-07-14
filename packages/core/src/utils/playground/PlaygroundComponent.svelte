<script lang="ts">
	import ErrorIndicatorComponent from 'packages/core/src/utils/errors/ErrorIndicatorComponent.svelte';
	import { onMount } from 'svelte';
	import {
		createInputFieldFAQExamples,
		VIEW_FIELD_EXAMPLE_DECLARATIONS,
	} from 'packages/core/src/utils/InputFieldExamples';
	import InputFieldExampleComponent from 'packages/core/src/utils/playground/InputFieldExampleComponent.svelte';
	import ViewFieldExampleComponent from 'packages/core/src/utils/playground/ViewFieldExampleComponent.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
	import { ErrorLevel, MetaBindExampleError } from 'packages/core/src/utils/errors/MetaBindErrors';
	import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import FlexRow from '../components/FlexRow.svelte';

	const {
		plugin,
	}: {
		plugin: IPlugin;
	} = $props();

	let exampleWarningDeclaration = 'INPUT[someInputFieldDeclaration]';
	let exampleWarningErrorCollection = $state(new ErrorCollection('exampleWarningErrorCollection'));

	let exampleErrorDeclaration = 'INPUT[someInputFieldDeclaration]';
	let exampleErrorErrorCollection = $state(new ErrorCollection('exampleErrorErrorCollection'));

	onMount(() => {
		exampleWarningErrorCollection.add(
			new MetaBindExampleError({
				errorLevel: ErrorLevel.WARNING,
				effect: 'some example warning',
				cause: 'some example reason',
			}),
		);

		exampleErrorErrorCollection.add(
			new MetaBindExampleError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'some example error',
				cause: 'some example reason',
			}),
		);
	});
</script>

<div class="mb-faq-view markdown-rendered">
	<FlexRow>
		<h1>Meta Bind Playground</h1>
		<span>
			<Button
				variant={ButtonStyleType.PRIMARY}
				on:click={() => {
					DocsUtils.open(DocsUtils.linkToHome());
				}}
			>
				Docs
			</Button>
			<Button
				on:click={() => {
					DocsUtils.open(DocsUtils.linkToGithub());
				}}
			>
				GitHub
			</Button>
			<Button
				on:click={() => {
					DocsUtils.open(DocsUtils.linkToIssues());
				}}
			>
				Report Issue
			</Button>
		</span>
	</FlexRow>

	<h2>Quick Reference</h2>

	<h3>Error Messages</h3>
	<p>
		When creating <a href={DocsUtils.linkToInputFields()}>Input Fields</a> or
		<a href={DocsUtils.linkToViewFields()}>View Fields</a>
		<strong>warnings</strong> (
		<ErrorIndicatorComponent
			plugin={plugin}
			settings={{
				errorCollection: exampleWarningErrorCollection,
				code: exampleWarningDeclaration,
			}}
		></ErrorIndicatorComponent>
		) and <strong>errors</strong> (
		<ErrorIndicatorComponent
			plugin={plugin}
			settings={{
				errorCollection: exampleErrorErrorCollection,
				code: exampleErrorDeclaration,
			}}
		></ErrorIndicatorComponent>
		) can occur. These are <strong>clickable</strong> and will show a modal with detailed information about the error
		when clicked.
	</p>

	<h3>Unloaded Message</h3>
	<p>
		A message like this <span class="mb-warning">[MB_UNLOADED] ...</span> means that Obsidian told Meta Bind to unload
		the field that was once displayed there. This usually happens when Meta Bind was disabled, such as after a plugin
		update, or when another plugin is interfering with Meta Bind.
	</p>
	<p>Usually reopening the note or restarting Obsidian causes the field to display normally again.</p>

	<h3>Bind Targets</h3>
	<p>
		<a href="https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/guides/inputfields/#binding-to-metadata"
			>Bind Targets</a
		>
		let the plugin know what frontmatter properties to bind
		<a href={DocsUtils.linkToInputFields()}>Input Fields</a>
		and
		<a href={DocsUtils.linkToViewFields()}>View Fields</a> to.
	</p>

	<h2>Playground</h2>

	<h3>Input Fields</h3>
	<p>
		<a href={DocsUtils.linkToInputFields()}>Input Fields</a> let you change the frontmatter of your notes from inside
		of notes.
	</p>

	{#each createInputFieldFAQExamples(plugin) as example}
		<InputFieldExampleComponent declaration={example[1]} plugin={plugin}></InputFieldExampleComponent>
	{/each}

	<h3>View Fields</h3>
	<p>
		<a href={DocsUtils.linkToViewFields()}>View Fields</a> let you view and perform calculations using the frontmatter
		of your notes from inside of notes. They will update instantly to reflect changes to the frontmatter made by input
		fields and as fast as obsidian allows it for changes from other sources.
	</p>

	{#each Object.values(VIEW_FIELD_EXAMPLE_DECLARATIONS) as examples}
		{#each examples as example}
			<ViewFieldExampleComponent declaration={example} plugin={plugin}></ViewFieldExampleComponent>
		{/each}
	{/each}
</div>
