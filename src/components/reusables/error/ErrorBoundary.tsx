import React from "react";
import logger from "@/utils/logger";
import SomethingWentWrong from "./SomethingWentWrong";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    logger.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <SomethingWentWrong />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
