import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
    MeetingRoom,
    CheckCircle,
    Event,
    Bookmark,
} from '@mui/icons-material';

interface StatsCardsProps {
    totalRooms: number;
    availableRooms: number;
    todayBookings: number;
    totalBookings: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
                                                   totalRooms,
                                                   availableRooms,
                                                   todayBookings,
                                                   totalBookings,
                                               }) => {
    const stats = [
        {
            title: 'Total Rooms',
            value: totalRooms,
            icon: <MeetingRoom sx={{ fontSize: 40 }} />,
    color: '#1976d2',
},
    {
        title: 'Available Rooms',
            value: availableRooms,
        icon: <CheckCircle sx={{ fontSize: 40 }} />,
        color: '#2e7d32',
    },
    {
        title: "Today's Bookings",
            value: todayBookings,
        icon: <Event sx={{ fontSize: 40 }} />,
        color: '#ed6c02',
    },
    {
        title: 'Total Bookings',
            value: totalBookings,
        icon: <Bookmark sx={{ fontSize: 40 }} />,
        color: '#9c27b0',
    },
];

    return (
        <Grid container spacing={3}>
        {stats.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper
                sx={{
        p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
    }}
>
    <Box>
        <Typography variant="body2" color="text.secondary">
        {stat.title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>
    {stat.value}
    </Typography>
    </Box>
    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
    </Paper>
    </Grid>
))}
    </Grid>
);
};

export default StatsCards;