import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Paper
                    sx={{
                        p: 4,
                        m: 2,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <ErrorIcon color="error" sx={{ fontSize: 64 }} />
                    <Typography variant="h5" color="error" gutterBottom>
                        Something went wrong
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                        >
                            Reload Page
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                            }}
                        >
                            Try Again
                        </Button>
                    </Box>
                </Paper>
            );
        }

        return this.props.children;
    }
}