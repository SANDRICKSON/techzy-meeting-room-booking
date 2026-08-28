import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Button,
    Grid,
    Paper,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { BookingStatus } from '../../domain/entities/Booking';
import { Room } from '../../domain/entities/Room';
import { Employee } from '../../domain/entities/Employee';

interface BookingFiltersProps {
    search: string;
    status?: BookingStatus;
    roomId?: string;
    employeeId?: string;
    onFilterChange: (filters: any) => void;
    rooms?: Room[];
    employees?: Employee[];
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
                                                           search,
                                                           status,
                                                           roomId,
                                                           employeeId,
                                                           onFilterChange,
                                                           rooms = [],
                                                           employees = [],
                                                       }) => {
    const handleChange = (key: string, value: any) => {
        onFilterChange({ [key]: value });
    };

    const handleClear = () => {
        onFilterChange({
            search: '',
            status: undefined,
            roomId: undefined,
            employeeId: undefined,
        });
    };

    const hasFilters = search || status || roomId || employeeId;

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search"
                        placeholder="Search by title or description..."
                        value={search || ''}
                        onChange={(e) => handleChange('search', e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status || ''}
                            onChange={(e) => handleChange('status', e.target.value || undefined)}
                            label="Status"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value={BookingStatus.CONFIRMED}>Confirmed</MenuItem>
                            <MenuItem value={BookingStatus.CANCELLED}>Cancelled</MenuItem>
                            <MenuItem value={BookingStatus.COMPLETED}>Completed</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {rooms.length > 0 && (
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Room</InputLabel>
                            <Select
                                value={roomId || ''}
                                onChange={(e) => handleChange('roomId', e.target.value || undefined)}
                                label="Room"
                            >
                                <MenuItem value="">All Rooms</MenuItem>
                                {rooms.map((room) => (
                                    <MenuItem key={room.id} value={room.id}>
                                        {room.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                {employees.length > 0 && (
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Employee</InputLabel>
                            <Select
                                value={employeeId || ''}
                                onChange={(e) => handleChange('employeeId', e.target.value || undefined)}
                                label="Employee"
                            >
                                <MenuItem value="">All Employees</MenuItem>
                                {employees.map((emp) => (
                                    <MenuItem key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                <Grid item xs={12} sm={hasFilters ? 2 : 3}>
                    <Box display="flex" gap={1}>
                        {hasFilters && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleClear}
                                startIcon={<ClearIcon />}
                                fullWidth
                            >
                                Clear
                            </Button>
                        )}
                    </Box>
                </Grid>
            </Grid>

            {hasFilters && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {search && (
                        <Chip
                            label={`Search: ${search}`}
                            size="small"
                            onDelete={() => handleChange('search', '')}
                        />
                    )}
                    {status && (
                        <Chip
                            label={`Status: ${status}`}
                            size="small"
                            onDelete={() => handleChange('status', undefined)}
                        />
                    )}
                    {roomId && rooms.find(r => r.id === roomId) && (
                        <Chip
                            label={`Room: ${rooms.find(r => r.id === roomId)?.name}`}
                            size="small"
                            onDelete={() => handleChange('roomId', undefined)}
                        />
                    )}
                    {employeeId && employees.find(e => e.id === employeeId) && (
                        <Chip
                            label={`Employee: ${employees.find(e => e.id === employeeId)?.name}`}
                            size="small"
                            onDelete={() => handleChange('employeeId', undefined)}
                        />
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default BookingFilters;