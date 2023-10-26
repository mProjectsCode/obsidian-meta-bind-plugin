<script lang='ts'>
	import { imagePathToUri } from '../../../../utils/Utils';

	export let value: string;
	export let showSuggester: () => void;
	export let onValueChange: (value: string) => void;

	export function setValue(v: string): void {
		value = v;
	}

	function openSuggester(event: MouseEvent) {
		showSuggester();
	}

	function openSuggesterOnKey(event: KeyboardEvent) {
		if (event.key === ' ') {
			showSuggester();
		}
	}
</script>

<style>
    .mb-image-suggest-input {
        background:    var(--background-secondary);
        border-radius: var(--meta-bind-plugin-border-radius);
        border:        var(--meta-bind-plugin-border-width) solid var(--background-modifier-border);
        padding:       var(--size-4-2);
        width:         100%;
    }

    .mb-image-suggest-image {
        width: 100%;
    }

    .mb-image-suggest-footer {
        display:        flex;
        flex-direction: row;
        color:          var(--text-normal);
        align-items:    baseline;
    }

    .mb-image-suggest-footer-text {
        flex:        1;
        margin-left: var(--size-4-2);
    }
</style>

<div class='mb-image-suggest-input'>
	{#if value}
		<img class='mb-image-suggest-image' src={imagePathToUri(value)} alt={value} />
	{/if}
	<div class='mb-image-suggest-footer'>
		<span class='mb-image-suggest-footer-text'>{value || 'no image selected'}</span>
		<button
			class='btn btn-active'
			on:click={openSuggester}
			on:keydown={openSuggesterOnKey}>
			Change Image
		</button>
	</div>
</div>
