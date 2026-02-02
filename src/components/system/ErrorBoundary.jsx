import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado.</h2>
            <p className="text-gray-500 mb-6">
              Encontramos um erro inesperado. Tente recarregar a página ou voltar ao início.
            </p>

            <div className="bg-gray-100 p-4 rounded-lg text-left text-xs font-mono text-gray-600 mb-6 overflow-auto max-h-40">
              {this.state.error && this.state.error.toString()}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Recarregar
              </Button>
              <Button onClick={this.handleReset} className="bg-[#0B2C4D] text-white gap-2">
                <Home className="h-4 w-4" /> Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
