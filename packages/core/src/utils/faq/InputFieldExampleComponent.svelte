<script lang="ts">
	import { RenderChildType } from 'packages/core/src/config/FieldConfigs';
	import { InputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
	import { InputFieldBase } from 'packages/core/src/fields/inputFields/InputFieldBase';
	import { getUUID } from 'packages/core/src/utils/Utils';
	import { IPlugin } from 'packages/core/src/IPlugin';
	import MountableComponent from 'packages/core/src/utils/components/MountableComponent.svelte';

	export let declaration: InputFieldDeclaration;
	export let plugin: IPlugin;

	let field = new InputFieldBase(plugin, getUUID(), '', RenderChildType.BLOCK, declaration);
</script>

<MountableComponent mountable={field}></MountableComponent>
