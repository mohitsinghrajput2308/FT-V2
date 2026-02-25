import React from 'react';

/**
 * ErrorBoundary — Catches render-time exceptions in any child component
 * and shows a friendly fallback instead of crashing the entire app.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // If a custom fallback was provided, use it
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: '#0f1117',
                    color: '#e2e8f0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '1.5rem',
                        padding: '3rem 2.5rem',
                        maxWidth: '480px',
                        width: '100%',
                        backdropFilter: 'blur(20px)',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            marginBottom: '0.75rem',
                            background: 'linear-gradient(135deg, #60a5fa, #34d399)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Something went wrong
                        </h2>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                            lineHeight: 1.6,
                            marginBottom: '1.5rem',
                        }}>
                            An unexpected error occurred. Your data is safe. Try refreshing the page or going back to the dashboard.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <pre style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '0.75rem',
                                padding: '1rem',
                                fontSize: '0.75rem',
                                color: '#fca5a5',
                                textAlign: 'left',
                                overflow: 'auto',
                                maxHeight: '150px',
                                marginBottom: '1.5rem',
                            }}>
                                {this.state.error.toString()}
                            </pre>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '0.65rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#e2e8f0',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    padding: '0.65rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={e => e.target.style.opacity = '0.9'}
                                onMouseOut={e => e.target.style.opacity = '1'}
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
