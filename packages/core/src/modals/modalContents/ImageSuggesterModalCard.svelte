<script lang="ts">
	import type { MetaBind } from '../..';

	const props: {
		mb: MetaBind;
		image: string;
		onSelect: (item: string) => void;
	} = $props();

	function keySelect(event: KeyboardEvent, image: string): void {
		if (event.key === ' ') {
			props.onSelect(image);
		}
	}
</script>

<div
	class="mb-image-card"
	onclick={() => props.onSelect(props.image)}
	onkeydown={event => keySelect(event, props.image)}
	role="button"
	tabindex="0"
>
	<img class="mb-image-card-image" src={props.mb.internal.imagePathToUri(props.image)} alt={props.image} />
	<div class="mb-image-card-footer">
		<span>{props.image}</span>
	</div>
</div>
