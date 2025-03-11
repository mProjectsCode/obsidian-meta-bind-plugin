<script lang="ts">
	import type { MetaBind } from 'packages/core/src';
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { InputFieldTemplate } from 'packages/core/src/Settings';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import FlexRow from 'packages/core/src/utils/components/FlexRow.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';

	let {
		mb,
		template = $bindable(),
		onDelete,
	}: {
		mb: MetaBind;
		template: InputFieldTemplate;
		onDelete: (template: InputFieldTemplate) => void;
	} = $props();
</script>

<div class="mb-card">
	<FlexRow>
		<input type="text" bind:value={template.name} placeholder="template-name" />
		<Button onclick={() => onDelete(template)} variant={ButtonStyleType.DESTRUCTIVE} tooltip="Delete Template">
			<Icon mb={mb} iconName="x" />
		</Button>
	</FlexRow>
	<textarea bind:value={template.declaration} placeholder="INPUT[slider(addLabels)]" class="mb-textarea"></textarea>
</div>
