import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Divider,
    Grid,
} from '@mui/material';
import { format } from 'date-fns';
import { Booking, BookingStatus } from '../../domain/entities/Booking';
import { useRoomStore } from '../../stores/roomStore';
import { useEmployeeStore } from '../../stores/employeeStore';

interface BookingDetailsProps {
    booking: Booking;
    open: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onCancel?: () => void;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
                                                           booking,
                                                           open,
                                                           onClose,
                                                           onEdit,
                                                           onCancel,
                                                       }) => {
    const { getRoom } = useRoomStore();
    const { getEmployee } = useEmployeeStore();

    const room = getRoom(booking.roomId);
    const organizer = getEmployee(booking.employeeId);
    const attendees = booking.attendees.map((id) => getEmployee(id)).filter(Boolean);

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'success';
            case BookingStatus.CANCELLED:
                return 'error';
            case BookingStatus.COMPLETED:
                return 'default';
            default:
                return 'default';
        }
    };

    const isPast = new Date(booking.startTime) < new Date();
    const isCancelled = booking.status === BookingStatus.CANCELLED;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">{booking.title}</Typography>
                    <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="medium"
                    />
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Date & Time
                        </Typography>
                        <Typography variant="body1">
                            {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}
                        </Typography>
                        <Typography variant="body2">
                            {format(new Date(booking.startTime), 'h:mm a')} -{' '}
                            {format(new Date(booking.endTime), 'h:mm a')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Duration:{' '}
                            {Math.round(
                                (new Date(booking.endTime).getTime() -
                                    new Date(booking.startTime).getTime()) /
                                (1000 * 60)
                            )}{' '}
                            minutes
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Room
                        </Typography>
                        <Typography variant="body1">{room?.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {room?.building}, Floor {room?.floor} • Capacity: {room?.capacity}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Organizer
                        </Typography>
                        <Typography variant="body1">{organizer?.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {organizer?.title} • {organizer?.department}
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Description
                        </Typography>
                        <Typography variant="body2">
                            {booking.description || 'No description provided'}
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Attendees ({attendees.length})
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                            {attendees.map((employee) => (
                                <Chip
                                    key={employee?.id}
                                    label={employee?.name || 'Unknown'}
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Grid>

                    {booking.notes && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Notes
                            </Typography>
                            <Typography variant="body2">{booking.notes}</Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                {!isPast && !isCancelled && (
                    <>
                        {onEdit && (
                            <Button onClick={onEdit} color="primary" variant="outlined">
                                Edit
                            </Button>
                        )}
                        {onCancel && (
                            <Button onClick={onCancel} color="error" variant="contained">
                                Cancel Booking
                            </Button>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default BookingDetails;