<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import { ButtonConfig, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import FlexRow from 'packages/core/src/utils/components/FlexRow.svelte';
	import { Notice, stringifyYaml } from 'obsidian';
	import { ButtonBuilderModal } from 'packages/core/src/modals/modalContents/buttonBuilder/ButtonBuilderModal';
	import MetaBindPlugin from '../../main';

	export let template: ButtonConfig;
	export let plugin: MetaBindPlugin;

	const dispatch = createEventDispatcher();

	function dispatchDeleteEvent(): void {
		dispatch('delete-template', {
			template: template,
		});
	}

	function editTemplate(): void {
		plugin.internal.openButtonBuilderModal({
			submitText: 'Submit',
			config: structuredClone(template),
			onOkay: newTemplate => {
				template = newTemplate;
			},
		});
	}

	function copyTemplate(): void {
		const yaml = stringifyYaml(template);
		void navigator.clipboard.writeText(yaml);
		new Notice('meta-bind | Copied to Clipboard');
	}
</script>

<div class="mb-card markdown-rendered">
	<FlexRow>
		<span>{template.id}</span>
		<Button on:click={() => editTemplate()} variant={ButtonStyleType.PRIMARY} tooltip="Edit">
			<Icon plugin={plugin} iconName="pen-line" />
		</Button>
		<Button on:click={() => copyTemplate()} variant={ButtonStyleType.DEFAULT} tooltip="Copy">
			<Icon plugin={plugin} iconName="copy" />
		</Button>
		<Button on:click={() => dispatchDeleteEvent()} variant={ButtonStyleType.DESTRUCTIVE} tooltip="Delete">
			<Icon plugin={plugin} iconName="x" />
		</Button>
	</FlexRow>
	<pre class="mb-pre"><code class="mb-none">{stringifyYaml(template)}</code></pre>
</div>
