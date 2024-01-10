<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../../utils/components/Button.svelte';
	import Icon from '../../utils/components/Icon.svelte';
	import { ButtonConfig, ButtonStyleType } from '../../config/ButtonConfig';
	import FlexRow from '../../utils/components/FlexRow.svelte';
	import { stringifyYaml } from 'obsidian';
	import { ButtonBuilderModal } from '../../fields/button/ButtonBuilderModal';
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
		new ButtonBuilderModal({
			plugin: plugin,
			onOkay: _ => {
				template = template;
			},
			submitText: 'Submit',
			config: template,
		}).open();
	}
</script>

<div class="mb-card markdown-rendered">
	<FlexRow>
		<span>{template.id}</span>
		<Button on:click={() => editTemplate()} variant={ButtonStyleType.PRIMARY} tooltip="Edit">
			<Icon iconName="pen-line" />
		</Button>
		<Button on:click={() => dispatchDeleteEvent()} variant={ButtonStyleType.DESTRUCTIVE} tooltip="Delete">
			<Icon iconName="x" />
		</Button>
	</FlexRow>
	<pre class="mb-pre"><code class="mb-none">{stringifyYaml(template)}</code></pre>
</div>
