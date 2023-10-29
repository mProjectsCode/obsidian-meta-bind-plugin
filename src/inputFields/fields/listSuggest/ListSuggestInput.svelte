<script src='../DateInputField.ts'></script>
<script src='ListSuggestInputField.ts'></script>
<script lang='ts'>
	import Icon from '../../../utils/Icon.svelte';
	import { Button } from 'obsidian-svelte';
	import { MBLiteral } from '../../../utils/Utils';
	import { isMdLink, parseMdLink } from '../../../parsers/MarkdownLinkParser';
	import LinkComponent from '../../../utils/LinkComponent.svelte';

	export let showSuggest: () => void;
	export let onValueChange: (value: any) => void;

	let value: MBLiteral[] = [];

	export function updateValue(v: MBLiteral[]): void {
		value = v;
	}

	function remove(i: number) {
		value.splice(i, 1);
		// call with copy of array
		onValueChange(value);
		// tell svelte to update
		value = value;
	}

	function suggest(event: MouseEvent): void {
		// don't fire the event if user clicked on the link
		if (!(event.target instanceof HTMLAnchorElement)) {
			showSuggest();
		}
	}

	function suggestKey(event: KeyboardEvent): void {
		if (event.key === ' ') {
			showSuggest();
		}
	}
</script>

<style>
    .suggest-input {
        background:    var(--background-secondary);
        border-radius: var(--meta-bind-plugin-border-radius);
        border:        var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
        padding:       5px 5px 5px 7px;
        cursor:        pointer;
        position:      relative;
        color:         var(--text-normal);
        display:       inline-flex;
        align-items:   center;
        gap:           5px;
    }

    .suggest-text {
        display: inline-block;
    }
</style>


<div class='mb-list-items'>
	{#each value as entry, i}
		<div class='mb-list-item'>
			{#if isMdLink(`${entry}`)}
                <span>
                    <LinkComponent mdLink={parseMdLink(`${entry}`)}></LinkComponent>
                </span>
			{:else}
				<span>{entry}</span>
			{/if}
			<Button on:click={() => remove(i)}>
				<Icon iconName='x' />
			</Button>
		</div>
	{:else}
		<span class='mb-list-empty'>Empty</span>
	{/each}
</div>
<div class='mb-list-input'>
	<div
		class='suggest-input'
		on:click={suggest}
		on:keydown={suggestKey}
		role='button'
		tabindex='0'>
		<div class='suggest-text'>
			<span>Add Element...</span>
		</div>
		<Icon iconName='list' />
	</div>
</div>

