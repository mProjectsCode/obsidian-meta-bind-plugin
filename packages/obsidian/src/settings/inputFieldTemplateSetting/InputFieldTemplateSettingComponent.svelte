<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import type { InputFieldTemplate } from 'packages/core/src/Settings';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import FlexRow from 'packages/core/src/utils/components/FlexRow.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';

	let {
		plugin,
		template = $bindable(),
		onDelete,
	}: {
		plugin: IPlugin;
		template: InputFieldTemplate;
		onDelete: (template: InputFieldTemplate) => void;
	} = $props();
</script>

<div class="mb-card">
	<FlexRow>
		<input type="text" bind:value={template.name} placeholder="template-name" />
		<Button onclick={() => onDelete(template)} variant={ButtonStyleType.DESTRUCTIVE} tooltip="Delete Template">
			<Icon plugin={plugin} iconName="x" />
		</Button>
	</FlexRow>
	<textarea
		bind:value={template.declaration}
		placeholder="INPUT[slider(addLabels)]"
		style="width: 100%; height: 100px; resize: vertical;"
	></textarea>
</div>
