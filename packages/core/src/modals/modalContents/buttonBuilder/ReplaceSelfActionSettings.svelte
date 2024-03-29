<script lang="ts">
	import { ReplaceSelfButtonAction } from 'packages/core/src/config/ButtonConfig';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let action: ReplaceSelfButtonAction;
	export let plugin: IPlugin;
</script>

<SettingComponent name="Replacement Text" description="The text to replace the match with."></SettingComponent>
<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.replacement}></textarea>
</div>
