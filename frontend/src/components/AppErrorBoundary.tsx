import type { ReactNode } from "react";
import { Component } from "react";

import ErrorState from "./ui/ErrorState";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class AppErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error) {
    console.error("UI render error:", error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-3xl px-6 py-10">
          <ErrorState
            title="Unable to render this page"
            message="CarePath hit an unexpected UI issue. Refresh the page or sign in again. The rest of the app is still available."
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
