import React, {Component} from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null, info: null};
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({hasError: true, error, info});
    // You can also log the error to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (process.env.NODE_ENV === 'development')
        return (
          <div>
            <p>
              <code>{JSON.stringify(this.state.error)}</code>
            </p>
            <p>
              <code>{JSON.stringify(this.state.info)}</code>
            </p>
          </div>
        );

      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
