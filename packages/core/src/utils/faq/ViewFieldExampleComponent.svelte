<script lang="ts">
	import { ViewFieldExampleDeclaration } from 'packages/core/src/utils/InputFieldExamples';
	import { IPlugin } from 'packages/core/src/IPlugin';
	import { FieldMountable } from 'packages/core/src/fields/FieldMountable';
	import MountableComponent from 'packages/core/src/utils/components/MountableComponent.svelte';
	import { RenderChildType } from 'packages/core/src/config/FieldConfigs';

	export let declaration: ViewFieldExampleDeclaration;

	export let plugin: IPlugin;

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
