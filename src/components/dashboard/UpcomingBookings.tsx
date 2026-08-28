import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Typography,
    Box,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { Booking } from '../../domain/entities/Booking';
import { useRoomStore } from '../../stores/roomStore';
import { useEmployeeStore } from '../../stores/employeeStore';

interface UpcomingBookingsProps {
    bookings: Booking[];
}

const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ bookings }) => {
    const { getRoom } = useRoomStore();
    const { getEmployee } = useEmployeeStore();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'success';
            case 'cancelled':
                return 'error';
            case 'completed':
                return 'default';
            default:
                return 'default';
        }
    };

    return (
        <List>
            {bookings.map((booking) => {
                const room = getRoom(booking.roomId);
                const organizer = getEmployee(booking.employeeId);
                const startTime = new Date(booking.startTime);

                return (
                    <ListItem
                        key={booking.id}
                        divider
                        secondaryAction={
                            <Chip
                                label={booking.status}
                                size="small"
                                color={getStatusColor(booking.status) as any}
                            />
                        }
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {booking.title.charAt(0).toUpperCase()}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="subtitle1">{booking.title}</Typography>
                                    <Chip label={room?.name || 'Unknown Room'} size="small" variant="outlined" />
                                </Box>
                            }
                            secondary={
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {format(startTime, 'MMM d, yyyy • h:mm a')} -{' '}
                                        {format(new Date(booking.endTime), 'h:mm a')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Organizer: {organizer?.name || 'Unknown'} •{' '}
                                        {booking.attendees.length} attendees
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Starts {formatDistanceToNow(startTime, { addSuffix: true })}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                );
            })}
        </List>
    );
};

export default UpcomingBookings;