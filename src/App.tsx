import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from './components/common/Layout';
import RoomsPage from './pages/RoomsPage';
import CalendarPage from './pages/CalendarPage';
import BookingsPage from './pages/BookingsPage';
import DashboardPage from "./pages/DashboardPages";
import { ErrorBoundary } from './components/common/ErrorBoundary';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <ErrorBoundary>
                    <BrowserRouter>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<DashboardPage />} />
                                <Route path="/rooms" element={<RoomsPage />} />
                                <Route path="/calendar" element={<CalendarPage />} />
                                <Route path="/bookings" element={<BookingsPage />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Layout>
                    </BrowserRouter>
                </ErrorBoundary>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;