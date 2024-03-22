<script lang="ts">
	import { ViewFieldExampleDeclaration } from 'packages/core/src/utils/InputFieldExamples';
	import { IPlugin } from 'packages/core/src/IPlugin';
	import { FieldBase } from 'packages/core/src/fields/FieldBase';
	import MountableComponent from 'packages/core/src/utils/components/MountableComponent.svelte';
	import { RenderChildType } from 'packages/core/src/config/FieldConfigs';

	export let declaration: ViewFieldExampleDeclaration;

	export let plugin: IPlugin;

	let ipf: FieldBase = plugin.api.createInlineFieldFromString(
		declaration.inputField,
		'',
		undefined,
		RenderChildType.BLOCK,
	);
	let vf: FieldBase = plugin.api.createInlineFieldFromString(
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
