import { Component } from 'react';

/** Keeps a failing WebGL scene from taking the whole page down. */
export default class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.error('3D scene failed:', err); }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children; }
}
