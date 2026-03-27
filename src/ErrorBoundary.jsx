import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err) {
    return { err }
  }

  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: '2rem',
            background: '#450a0a',
            color: '#fecaca',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '1.1rem' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', fontSize: '12px' }}>
            {String(this.state.err?.message || this.state.err)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
