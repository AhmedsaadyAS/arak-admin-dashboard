import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ChartErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Chart Error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false });
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px] bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
                    <h3 className="text-gray-700 font-semibold mb-1">Could not load chart</h3>
                    <p className="text-gray-500 text-sm mb-4">We encountered an issue processing the data.</p>
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ChartErrorBoundary;
