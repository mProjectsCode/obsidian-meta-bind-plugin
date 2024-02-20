<script lang="ts">
	import { IPlugin } from '../../../../IPlugin';

	export let plugin: IPlugin;
	export let value: number;
	export let placeholder: string;
	export let onValueChange: (value: number) => void;

	export function setValue(v: number): void {
		value = v;
	}
</script>

<input type="number" tabindex="0" placeholder={placeholder} bind:value={value} on:input={() => onValueChange(value)} />
