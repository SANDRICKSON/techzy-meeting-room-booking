import React, { useEffect, useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    Slider,
} from '@mui/material';
import { useRoomStore } from '../../stores/roomStore';
import BookingForm from '../bookings/BookingForm';
import { Room } from '../../domain/entities/Room';
import { LoadingSpinner } from '../common/LoadingSpinner';

const RoomsList: React.FC = () => {
    const {
        filters,
        setFilters,
        getFilteredRooms,
        loadMetadata,
        buildings,
        equipment,
        loading
    } = useRoomStore();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [bookingFormOpen, setBookingFormOpen] = useState(false);

    useEffect(() => {
        loadMetadata();
    }, [loadMetadata]);

    const filteredRooms = getFilteredRooms();

    const handleBookRoom = (room: Room) => {
        setSelectedRoom(room);
        setBookingFormOpen(true);
    };

    if (loading) {
        return <LoadingSpinner message="Loading rooms..." />;
    }

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Search"
                            placeholder="Search by name or building..."
                            value={filters.search || ''}
                            onChange={(e) => setFilters({ search: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Building</InputLabel>
                            <Select
                                value={filters.building || ''}
                                onChange={(e) => setFilters({ building: e.target.value || undefined })}
                                label="Building"
                            >
                                <MenuItem value="">All Buildings</MenuItem>
                                {buildings.map((b) => (
                                    <MenuItem key={b} value={b}>{b}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Equipment</InputLabel>
                            <Select
                                multiple
                                value={filters.equipment || []}
                                onChange={(e) => setFilters({ equipment: e.target.value as string[] })}
                                label="Equipment"
                                renderValue={(selected) => (selected as string[]).join(', ')}
                            >
                                {equipment.map((eq) => (
                                    <MenuItem key={eq} value={eq}>{eq}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Typography variant="caption" display="block" gutterBottom>
                            Min Capacity: {filters.minCapacity || 0}
                        </Typography>
                        <Slider
                            value={filters.minCapacity || 0}
                            onChange={(_, value) => setFilters({ minCapacity: value as number })}
                            min={0}
                            max={30}
                            size="small"
                        />
                    </Grid>
                </Grid>
            </Paper>

            {filteredRooms.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No rooms match your filters
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredRooms.map((room) => (
                        <Grid item xs={12} sm={6} md={4} key={room.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {room.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {room.building}, Floor {room.floor}
                                    </Typography>
                                    <Typography variant="body2">
                                        Capacity: {room.capacity} people
                                    </Typography>
                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {room.equipment.slice(0, 3).map((eq) => (
                                            <Chip key={eq} label={eq} size="small" variant="outlined" />
                                        ))}
                                        {room.equipment.length > 3 && (
                                            <Chip label={`+${room.equipment.length - 3}`} size="small" />
                                        )}
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handleBookRoom(room)}
                                    >
                                        Book Room
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {selectedRoom && (
                <BookingForm
                    open={bookingFormOpen}
                    onClose={() => {
                        setBookingFormOpen(false);
                        setSelectedRoom(null);
                    }}
                    initialRoomId={selectedRoom.id}
                />
            )}
        </Box>
    );
};

export default RoomsList;