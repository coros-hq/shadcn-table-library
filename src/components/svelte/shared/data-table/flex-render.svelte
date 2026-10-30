<script lang="ts" generics="TContext extends Record<string, any>">
  import type { ColumnDefTemplate } from '@tanstack/table-core'
  import { RenderComponentConfig, RenderSnippetConfig } from './render-helpers.js'

  type Props = {
    /** A column's `header`, `cell` or `footer` */
    content?: ColumnDefTemplate<TContext>
    context: TContext
  }

  let { content, context }: Props = $props()
</script>

{#if typeof content === 'string'}
  {content}
{:else if content instanceof Function}
  {@const result = content(context)}
  {#if result instanceof RenderComponentConfig}
    {@const Component = result.component}
    <Component {...result.props} />
  {:else if result instanceof RenderSnippetConfig}
    {@render result.snippet(result.params)}
  {:else}
    {result}
  {/if}
{/if}
