<script lang="ts">
	import type { InputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
	import { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
	import { getUUID } from 'packages/core/src/utils/Utils';
	import type { IPlugin } from 'packages/core/src/IPlugin';
	import MountableComponent from 'packages/core/src/utils/components/MountableComponent.svelte';
	import { RenderChildType } from 'packages/core/src/config/APIConfigs';

	const {
		plugin,
		declaration,
	}: {
		plugin: IPlugin;
		declaration: InputFieldDeclaration;
	} = $props();

	let field = new InputFieldMountable(plugin, getUUID(), '', RenderChildType.BLOCK, declaration);
</script>

<MountableComponent mountable={field}></MountableComponent>
