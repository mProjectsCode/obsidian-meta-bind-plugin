<script lang="ts">
	import { RenderChildType } from 'packages/core/src/config/APIConfigs';
	import { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';

	import type { InputFieldDeclaration } from 'packages/core/src/parsers/inputFieldParser/InputFieldDeclaration';
	import MountableComponent from 'packages/core/src/utils/components/MountableComponent.svelte';
	import { getUUID } from 'packages/core/src/utils/Utils';
	import type { MetaBind } from '../..';

	const {
		mb,
		declaration,
	}: {
		mb: MetaBind;
		declaration: InputFieldDeclaration;
	} = $props();

	let field = new InputFieldMountable(mb, getUUID(), '', RenderChildType.BLOCK, declaration);
</script>

<MountableComponent mountable={field}></MountableComponent>
