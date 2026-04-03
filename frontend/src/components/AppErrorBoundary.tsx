import type { ReactNode } from "react";
import { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ErrorState from "./ui/ErrorState";

interface BoundaryProps {
  children: ReactNode;
  resetKey: string;
  onRefresh: () => void;
}

interface WrapperProps {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  lastResetKey: string;
}

class AppErrorBoundaryInner extends Component<BoundaryProps, State> {
  public state: State = { hasError: false, lastResetKey: this.props.resetKey };

  public static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  public static getDerivedStateFromProps(props: BoundaryProps, state: State): Partial<State> | null {
    if (props.resetKey !== state.lastResetKey) {
      return {
        hasError: false,
        lastResetKey: props.resetKey,
      };
    }

    return null;
  }

  public componentDidCatch(error: Error) {
    console.error("UI render error:", error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <ErrorState
            title="Unable to render this page"
            message="CarePath hit an unexpected UI issue. Refresh the page or move to another page. The rest of the app is still available."
            actionLabel="Refresh page"
            onAction={this.props.onRefresh}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

function AppErrorBoundary({ children }: WrapperProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppErrorBoundaryInner
      resetKey={`${location.pathname}${location.search}${location.hash}`}
      onRefresh={() => navigate(0)}
    >
      {children}
    </AppErrorBoundaryInner>
  );
}

export default AppErrorBoundary;
