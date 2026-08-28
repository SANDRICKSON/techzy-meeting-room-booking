import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Typography,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useBookingStore } from '../../stores/bookingStore';
import { useRoomStore } from '../../stores/roomStore';
import { useEmployeeStore } from '../../stores/employeeStore';
import { Booking, BookingStatus } from '../../domain/entities/Booking';
import BookingFilters from './BookingFilters';
import BookingDetails from './BookingDetails';
import BookingForm from './BookingForm';
import { LoadingSpinner } from '../common/LoadingSpinner';

const BookingsList: React.FC = () => {
    const {
        bookings,
        fetchBookings,
        cancelBooking,
        getFilteredBookings,
        filters,
        setFilters,
        loading,
    } = useBookingStore();
    const { getRoom, rooms } = useRoomStore();
    const { getEmployee, employees } = useEmployeeStore();

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const filteredBookings = getFilteredBookings();
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status !== BookingStatus.CANCELLED).length;

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

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setDetailsOpen(true);
    };

    const handleEdit = (booking: Booking) => {
        setSelectedBooking(booking);
        setEditOpen(true);
    };

    const handleDelete = (id: string) => {
        setBookingToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (bookingToDelete) {
            await cancelBooking(bookingToDelete);
            setDeleteDialogOpen(false);
            setBookingToDelete(null);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading bookings..." />;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                    Total: {totalBookings} bookings
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        ({activeBookings} active)
                    </Typography>
                </Typography>
            </Box>

            <BookingFilters
                search={filters.search || ''}
                status={filters.status}
                roomId={filters.roomId}
                employeeId={filters.employeeId}
                onFilterChange={setFilters}
                rooms={rooms}
                employees={employees}
            />

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Room</TableCell>
                            <TableCell>Date & Time</TableCell>
                            <TableCell>Organizer</TableCell>
                            <TableCell>Attendees</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                        No bookings found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBookings.map((booking) => {
                                const room = getRoom(booking.roomId);
                                const organizer = getEmployee(booking.employeeId);

                                const isUpcoming = new Date(booking.startTime) > new Date();
                                const canEdit = isUpcoming && booking.status !== BookingStatus.CANCELLED;

                                return (
                                    <TableRow key={booking.id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                {booking.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{room?.name || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {format(new Date(booking.startTime), 'MMM d, yyyy')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {format(new Date(booking.startTime), 'h:mm a')} -{' '}
                                                {format(new Date(booking.endTime), 'h:mm a')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{organizer?.name || 'Unknown'}</TableCell>
                                        <TableCell>{booking.attendees.length}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.status}
                                                size="small"
                                                color={getStatusColor(booking.status)}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewDetails(booking)}
                                                aria-label="View details"
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                            {/* ✅ FIXED: only upcoming bookings can be edited */}
                                            {canEdit && (
                                                <>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(booking)}
                                                        aria-label="Edit booking"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(booking.id)}
                                                        aria-label="Cancel booking"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedBooking && (
                <BookingDetails
                    booking={selectedBooking}
                    open={detailsOpen}
                    onClose={() => {
                        setDetailsOpen(false);
                        setSelectedBooking(null);
                    }}
                />
            )}

            {selectedBooking && (
                <BookingForm
                    open={editOpen}
                    onClose={() => {
                        setEditOpen(false);
                        setSelectedBooking(null);
                    }}
                    editBooking={selectedBooking}
                />
            )}

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Cancel Booking</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>No, Keep</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Yes, Cancel Booking
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookingsList;