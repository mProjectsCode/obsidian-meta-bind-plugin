<script lang="ts">
	import { RenderChildType } from 'packages/core/src/config/FieldConfigs';
	import { InputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
	import { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
	import { getUUID } from 'packages/core/src/utils/Utils';
	import { IPlugin } from 'packages/core/src/IPlugin';
	import MountableComponent from 'packages/core/src/utils/components/MountableComponent.svelte';

	export let declaration: InputFieldDeclaration;
	export let plugin: IPlugin;

	let field = new InputFieldMountable(plugin, getUUID(), '', RenderChildType.BLOCK, declaration);
</script>

<MountableComponent mountable={field}></MountableComponent>
