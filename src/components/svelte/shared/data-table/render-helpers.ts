import type { Component, ComponentProps, Snippet } from 'svelte'

/** Marks a column `header`/`cell` result as a Svelte component to mount */
export class RenderComponentConfig<TComponent extends Component<any>> {
  constructor(
    public component: TComponent,
    public props: ComponentProps<TComponent> | Record<string, never>,
  ) {}
}

/** Marks a column `header`/`cell` result as a snippet to render */
export class RenderSnippetConfig<TProps> {
  constructor(
    public snippet: Snippet<[TProps]>,
    public params: TProps,
  ) {}
}

export function renderComponent<
  T extends Component<any>,
  Props extends ComponentProps<T>,
>(component: T, props: Props = {} as Props) {
  return new RenderComponentConfig(component, props)
}

export function renderSnippet<TProps>(
  snippet: Snippet<[TProps]>,
  params: TProps = {} as TProps,
) {
  return new RenderSnippetConfig(snippet, params)
}
