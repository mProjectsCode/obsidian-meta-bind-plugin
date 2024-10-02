<script lang="ts">
	import { Notice, stringifyYaml } from 'obsidian';
	import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import FlexRow from 'packages/core/src/utils/components/FlexRow.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';

	let {
		plugin,
		template = $bindable(),
		onDelete,
	}: {
		plugin: IPlugin;
		template: ButtonConfig;
		onDelete: (template: ButtonConfig) => void;
	} = $props();

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
		new Notice('meta-bind | Copied to clipboard');
	}
</script>

<div class="mb-card markdown-rendered">
	<FlexRow>
		<span>{template.id}</span>
		<Button onclick={() => editTemplate()} variant={ButtonStyleType.PRIMARY} tooltip="Edit">
			<Icon plugin={plugin} iconName="pen-line" />
		</Button>
		<Button onclick={() => copyTemplate()} variant={ButtonStyleType.DEFAULT} tooltip="Copy">
			<Icon plugin={plugin} iconName="copy" />
		</Button>
		<Button onclick={() => onDelete(template)} variant={ButtonStyleType.DESTRUCTIVE} tooltip="Delete">
			<Icon plugin={plugin} iconName="x" />
		</Button>
	</FlexRow>
	<pre class="mb-pre"><code class="mb-none">{stringifyYaml(template)}</code></pre>
</div>
