import { Component } from 'react'

type MdxRenderBoundaryProps = {
  children: React.ReactNode
  sourceKey: string
  onError: (message: string | null) => void
}

type MdxRenderBoundaryState = {
  sourceKey: string
  error: string | null
}

export class MdxRenderBoundary extends Component<
  MdxRenderBoundaryProps,
  MdxRenderBoundaryState
> {
  state: MdxRenderBoundaryState = {
    sourceKey: this.props.sourceKey,
    error: null
  }

  static getDerivedStateFromError(cause: unknown): Partial<MdxRenderBoundaryState> {
    return { error: cause instanceof Error ? cause.message : String(cause) }
  }

  static getDerivedStateFromProps(
    props: MdxRenderBoundaryProps,
    state: MdxRenderBoundaryState
  ): Partial<MdxRenderBoundaryState> | null {
    if (props.sourceKey !== state.sourceKey) return { sourceKey: props.sourceKey, error: null }
    return null
  }

  componentDidCatch(cause: unknown): void {
    this.props.onError(cause instanceof Error ? cause.message : String(cause))
  }

  componentDidUpdate(previousProps: MdxRenderBoundaryProps): void {
    if (previousProps.sourceKey !== this.props.sourceKey) this.props.onError(null)
  }

  render(): React.ReactNode {
    if (this.state.error) return null
    return this.props.children
  }
}
