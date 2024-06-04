import React from "react";

interface Myprops {
  children: any;
}

interface Mystate {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<Myprops, Mystate> {
  constructor(props: any) {
    super(props);

    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    const { hasError, errorMessage } = this.state;
    const { children } = this.props;
    if (hasError) {
      return (
        <div className="alert">
          <h1>Uh oh!</h1>
          <p>
            This wasn&apos;t supposed to happen. If you continue to see this
            message, please reach out to support.
          </p>
          <div className="errormsg">
            <h3>Error:</h3>
            <p>{errorMessage}</p>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
