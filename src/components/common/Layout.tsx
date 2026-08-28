import React, { ReactNode } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Navigation from './Navigation';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Navigation />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - 240px)` },
                    ml: { sm: '240px' },
                    mt: '64px',
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;