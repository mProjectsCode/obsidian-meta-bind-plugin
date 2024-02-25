<script lang="ts">
	import ErrorIndicatorComponent from 'packages/core/src/utils/errors/ErrorIndicatorComponent.svelte';
	import { onMount } from 'svelte';
	import { createInputFieldFAQExamples } from 'packages/core/src/utils/InputFieldExamples';
	import InputFieldExampleComponent from 'packages/core/src/utils/faq/InputFieldExampleComponent.svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
	import { ErrorLevel, MetaBindExampleError } from 'packages/core/src/utils/errors/MetaBindErrors';
	import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let plugin: IPlugin;

	let exampleWarningDeclaration = 'INPUT[someInputFieldDeclaration]';
	let exampleWarningErrorCollection = new ErrorCollection('exampleWarningErrorCollection');

	let exampleErrorDeclaration = 'INPUT[someInputFieldDeclaration]';
	let exampleErrorErrorCollection = new ErrorCollection('exampleErrorErrorCollection');

	onMount(() => {
		exampleWarningErrorCollection.add(
			new MetaBindExampleError({
				errorLevel: ErrorLevel.WARNING,
				effect: 'some example warning',
				cause: 'some example reason',
			}),
		);
		exampleWarningErrorCollection = exampleWarningErrorCollection;

		exampleErrorErrorCollection.add(
			new MetaBindExampleError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'some example error',
				cause: 'some example reason',
			}),
		);
		exampleErrorErrorCollection = exampleErrorErrorCollection;
	});
</script>

<div class="mb-faq-view markdown-rendered">
	<h1>Meta Bind FAQ</h1>

	<h2>Quick Access</h2>
	<p>
		<Button
			variant={ButtonStyleType.PRIMARY}
			on:click={() => {
				DocsUtils.open(DocsUtils.linkToHome());
			}}
			>Docs
		</Button>
		<Button
			on:click={() => {
				DocsUtils.open(DocsUtils.linkToGithub());
			}}
			>GitHub
		</Button>
		<Button
			on:click={() => {
				DocsUtils.open(DocsUtils.linkToIssues());
			}}
			>Report Issue
		</Button>
	</p>

	<h2>Error Messages</h2>
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

	<h2>Input Fields</h2>
	<p>
		<a href={DocsUtils.linkToInputFields()}>Input Fields</a> let you change the frontmatter of your notes from inside
		of notes.
	</p>

	{#each createInputFieldFAQExamples(plugin) as example}
		<InputFieldExampleComponent declaration={example[1]} plugin={plugin}></InputFieldExampleComponent>
	{/each}

	<h2>View Fields</h2>
	<p>
		<a href={DocsUtils.linkToViewFields()}>View Fields</a> let you view and perform calculations using the frontmatter
		of your notes from inside of notes. They will update instantly to reflect changes to the frontmatter made by input
		fields and as fast as obsidian allows it for changes from other sources.
	</p>

	<h2>Bind Targets</h2>
	<p>
		<a href="https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/guides/inputfields/#binding-to-metadata"
			>Bind Targets</a
		>
		let the plugin know what frontmatter properties to bind
		<a href={DocsUtils.linkToInputFields()}>Input Fields</a>
		and
		<a href={DocsUtils.linkToViewFields()}>View Fields</a> to.
	</p>
</div>
