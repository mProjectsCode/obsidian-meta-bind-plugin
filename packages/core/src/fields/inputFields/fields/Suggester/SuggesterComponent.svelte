<script lang="ts">
	import { ButtonStyleType } from 'meta-bind-core/src/config/ButtonConfig';
	import type { InputFieldSvelteProps } from 'meta-bind-core/src/fields/inputFields/InputFieldSvelteWrapper';
	import { MDLinkParser } from 'meta-bind-core/src/parsers/MarkdownLinkParser';
	import Button from 'meta-bind-core/src/utils/components/Button.svelte';
	import Icon from 'meta-bind-core/src/utils/components/Icon.svelte';
	import LinkComponent from 'meta-bind-core/src/utils/components/LinkComponent.svelte';
	import type { MBLiteral } from 'meta-bind-core/src/utils/Literal';

	const props: InputFieldSvelteProps<MBLiteral> & {
		showSuggester: () => void;
		showTextPrompt: () => void;
		editLinkText: () => void;
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
		<Icon mb={props.mb} iconName="list" />
	</Button>
	{#if mdLink !== undefined}
		<Button variant={ButtonStyleType.PLAIN} onclick={props.editLinkText} tooltip="Edit link text">
			<Icon mb={props.mb} iconName="pencil" />
		</Button>
	{/if}
	{#if props.allowOther}
		<Button variant={ButtonStyleType.PLAIN} onclick={props.showTextPrompt}>
			<Icon mb={props.mb} iconName="pencil" />
		</Button>
	{/if}
</div>
