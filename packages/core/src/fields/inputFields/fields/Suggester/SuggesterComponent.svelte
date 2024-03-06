<script lang="ts">
	import Icon from '../../../../utils/components/Icon.svelte';
	import LinkComponent from '../../../../utils/components/LinkComponent.svelte';
	import { MarkdownLink, MDLinkParser } from '../../../../parsers/MarkdownLinkParser';
	import { onMount } from 'svelte';
	import { MBLiteral } from '../../../../utils/Literal';
	import { IPlugin } from '../../../../IPlugin';
	import Button from '../../../../utils/components/Button.svelte';
	import { ButtonStyleType } from '../../../../config/ButtonConfig';

	export let plugin: IPlugin;
	export let value: MBLiteral;
	export let showSuggester: () => void;
	export let showTextPrompt: () => void;
	// TODO: implement allowOther option
	export let allowOther: boolean;
	export let onValueChange: (value: MBLiteral) => void;

	let mdLink: MarkdownLink;
	let str: string;
	let isLink: boolean = false;

	onMount(() => {
		setValue(value);
	});

	export function setValue(v: MBLiteral): void {
		let valueAsString = v?.toString() ?? 'null';

		isLink = MDLinkParser.isLink(valueAsString);
		if (isLink) {
			try {
				mdLink = MDLinkParser.parseLink(valueAsString);
			} catch (e) {
				console.warn(e);
			}
		} else {
			str = valueAsString;
		}
	}
</script>

<div class="mb-suggest-input">
	<div class="mb-suggest-text">
		{#if isLink}
			<LinkComponent bind:mdLink={mdLink}></LinkComponent>
		{:else}
			<span>{str}</span>
		{/if}
	</div>
	<Button variant={ButtonStyleType.PLAIN} on:click={showSuggester}>
		<Icon plugin={plugin} iconName="list" />
	</Button>
	{#if allowOther}
		<Button variant={ButtonStyleType.PLAIN} on:click={showTextPrompt}>
			<Icon plugin={plugin} iconName="pencil" />
		</Button>
	{/if}
</div>
