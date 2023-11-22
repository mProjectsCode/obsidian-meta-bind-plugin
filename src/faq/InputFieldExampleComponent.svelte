<script lang="ts">
	import { InputFieldType, RenderChildType } from '../config/FieldConfigs';
	import { UnvalidatedInputFieldDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';
	import { onDestroy, onMount } from 'svelte';
	import MetaBindPlugin from '../main';
	import { Component } from 'obsidian';

	export let type: InputFieldType;
	export let declaration: UnvalidatedInputFieldDeclaration;
	export let plugin: MetaBindPlugin;

	let component: Component;
	let targetEl: HTMLElement;

	onMount(() => {
		component = new Component();

		plugin.api.createInputField(declaration, RenderChildType.BLOCK, '', targetEl, component);

		component.load();
	});

	onDestroy(() => {
		component.unload();
	});
</script>

<div bind:this={targetEl}></div>
