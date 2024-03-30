<script lang="ts">
	import { InlineJsButtonAction } from 'packages/core/src/config/ButtonConfig';
	import SettingComponent from 'packages/core/src/utils/components/SettingComponent.svelte';
	import { IPlugin } from 'packages/core/src/IPlugin';

	export let action: InlineJsButtonAction;
	export let plugin: IPlugin;
</script>

<SettingComponent name="JS Code" description="The JavaScript code to run."></SettingComponent>

<div class="meta-bind-full-width meta-bind-high">
	<textarea bind:value={action.code}></textarea>
</div>
