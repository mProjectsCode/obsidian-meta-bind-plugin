<script lang="ts">
	import { Button } from 'obsidian-svelte';
	import { DocsHelper } from '../DocsHelper';
	import ErrorIndicatorComponent from '../errors/ErrorIndicatorComponent.svelte';
	import { App } from 'obsidian';
	import { ErrorCollection } from '../errors/ErrorCollection';
	import { onMount } from 'svelte';
	import { ErrorLevel, MetaBindExampleError } from '../errors/MetaBindErrors';
	import { createInputFieldExamples } from './InputFieldExamples';
	import MetaBindPlugin from '../../main';
	import InputFieldExampleComponent from './InputFieldExampleComponent.svelte';

	export let app: App;
	export let plugin: MetaBindPlugin;

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
			variant="primary"
			on:click={() => {
				DocsHelper.open(DocsHelper.linkToHome());
			}}
			>Docs
		</Button>
		<Button
			variant="default"
			on:click={() => {
				DocsHelper.open(DocsHelper.linkToGithub());
			}}
			>GitHub
		</Button>
		<Button
			variant="default"
			on:click={() => {
				DocsHelper.open(DocsHelper.linkToIssues());
			}}
			>Report Issue
		</Button>
	</p>

	<h2>Error Messages</h2>
	<p>
		When creating <a href={DocsHelper.linkToInputFields()}>Input Fields</a> or
		<a href={DocsHelper.linkToViewFields()}>View Fields</a>
		<strong>warnings</strong>
		(
		<ErrorIndicatorComponent
			app={app}
			declaration={exampleWarningDeclaration}
			errorCollection={exampleWarningErrorCollection}
		></ErrorIndicatorComponent>
		) and <strong>errors</strong>
		(
		<ErrorIndicatorComponent
			app={app}
			declaration={exampleErrorDeclaration}
			errorCollection={exampleErrorErrorCollection}
		></ErrorIndicatorComponent>
		) can occur. These are <strong>clickable</strong> and will show a modal with detailed information about the error
		when clicked.
	</p>

	<h2>Input Fields</h2>
	<p>
		<a href={DocsHelper.linkToInputFields()}>Input Fields</a> let you change the frontmatter of your notes from inside
		of notes.
	</p>

	{#each createInputFieldExamples(plugin) as example}
		<InputFieldExampleComponent type={example[0]} declaration={example[1]} plugin={plugin}
		></InputFieldExampleComponent>
	{/each}

	<h2>View Fields</h2>
	<p>
		<a href={DocsHelper.linkToViewFields()}>View Fields</a> let you view and perform calculations using the frontmatter
		of your notes from inside of notes. They will update instantly to reflect changes to the frontmatter made by input
		fields and as fast as obsidian allows it for changes from other sources.
	</p>

	<h2>Bind Targets</h2>
	<p>
		<a href="https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/guides/inputfields/#binding-to-metadata"
			>Bind Targets</a
		>
		let the plugin know what frontmatter properties to bind
		<a href={DocsHelper.linkToInputFields()}>Input Fields</a>
		and
		<a href={DocsHelper.linkToViewFields()}>View Fields</a> to.
	</p>
</div>
