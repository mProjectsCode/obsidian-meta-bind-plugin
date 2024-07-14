<script lang="ts">
	import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
	import type { InputFieldSvelteProps } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
	import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
	import Button from 'packages/core/src/utils/components/Button.svelte';
	import Icon from 'packages/core/src/utils/components/Icon.svelte';
	import LinkComponent from 'packages/core/src/utils/components/LinkComponent.svelte';
	import type { MBLiteral } from 'packages/core/src/utils/Literal';

	const props: InputFieldSvelteProps<MBLiteral> & {
		showSuggester: () => void;
		showTextPrompt: () => void;
		allowOther: boolean;
	} = $props();

	let value = $state(props.value);

	export function setValue(v: MBLiteral): void {
		value = v;
	}

	let str = $derived(value?.toString() ?? 'null');
	let mdLink = $derived.by(() => {
		if (MDLinkParser.isLink(str)) {
			try {
				return MDLinkParser.parseLink(str);
			} catch (e) {
				console.warn(e);
			}
		}

		return undefined;
	});
</script>

<div class="mb-suggest-input">
	<div class="mb-suggest-text">
		{#if mdLink !== undefined}
			<LinkComponent mdLink={mdLink}></LinkComponent>
		{:else}
			<span>{str}</span>
		{/if}
	</div>
	<Button variant={ButtonStyleType.PLAIN} onclick={props.showSuggester}>
		<Icon plugin={props.plugin} iconName="list" />
	</Button>
	{#if props.allowOther}
		<Button variant={ButtonStyleType.PLAIN} onclick={props.showTextPrompt}>
			<Icon plugin={props.plugin} iconName="pencil" />
		</Button>
	{/if}
</div>
