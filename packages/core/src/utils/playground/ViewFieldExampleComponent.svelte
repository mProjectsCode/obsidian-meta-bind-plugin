<script lang="ts">
	import { RenderChildType } from 'packages/core/src/config/APIConfigs';
	import type { FieldMountable } from 'packages/core/src/fields/FieldMountable';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import MountableComponent from 'packages/core/src/utils/components/MountableComponent.svelte';
	import type { ViewFieldExampleDeclaration } from 'packages/core/src/utils/InputFieldExamples';

	const {
		plugin,
		declaration,
	}: {
		plugin: IPlugin;
		declaration: ViewFieldExampleDeclaration;
	} = $props();

	let ipf: FieldMountable = plugin.api.createInlineFieldFromString(
		declaration.inputField,
		'',
		undefined,
		RenderChildType.BLOCK,
	);
	let vf: FieldMountable = plugin.api.createInlineFieldFromString(
		declaration.declaration,
		'',
		undefined,
		RenderChildType.BLOCK,
	);
</script>

<div class="mb-card">
	<h3>{declaration.title}</h3>

	<MountableComponent mountable={ipf}></MountableComponent>
	<MountableComponent mountable={vf}></MountableComponent>

	<code>{declaration.display}</code>
</div>
