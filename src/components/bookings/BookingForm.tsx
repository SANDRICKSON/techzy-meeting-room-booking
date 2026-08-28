import React, {useState, useEffect, useCallback} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Chip,
    Box,
    Alert,
    FormHelperText,
    Typography,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Paper,
} from '@mui/material';
import {DateTimePicker} from '@mui/x-date-pickers';
import {useRoomStore} from '../../stores/roomStore';
import {useBookingStore} from '../../stores/bookingStore';
import {useEmployeeStore} from '../../stores/employeeStore';
import {Booking, BookingStatus} from '../../domain/entities/Booking';
import {debounce} from 'lodash';

interface BookingFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editBooking?: Booking;
    initialRoomId?: string;
}

interface AvailabilitySlot {
    start: Date;
    end: Date;
    available: boolean;
    conflicts: Booking[];
}

const BookingForm: React.FC<BookingFormProps> = ({
                                                     open,
                                                     onClose,
                                                     onSuccess,
                                                     editBooking,
                                                     initialRoomId,
                                                 }) => {
    const {rooms, fetchRooms} = useRoomStore();
    const {employees, fetchEmployees} = useEmployeeStore();
    const {createBooking, updateBooking, getBookingsForRoom} = useBookingStore();

    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        roomId: initialRoomId || '',
        employeeId: '',
        title: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        attendees: [] as string[],
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [availabilityCheck, setAvailabilityCheck] = useState<{
        available: boolean;
        conflicts: Booking[];
        suggestedSlots?: AvailabilitySlot[];
    } | null>(null);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});


    useEffect(() => {
        if (open) {
            fetchRooms();
            fetchEmployees();
        }
    }, [open, fetchRooms, fetchEmployees]);


    useEffect(() => {
        if (!open) {
            setFormData({
                roomId: initialRoomId || '',
                employeeId: '',
                title: '',
                description: '',
                startTime: new Date(),
                endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
                attendees: [],
                notes: '',
            });
            setErrors({});
            setSubmitError(null);
            setLoading(false);
            setAvailabilityCheck(null);
            setActiveStep(0);
            setTouched({});
        }
    }, [open, initialRoomId]);


    useEffect(() => {
        if (editBooking) {
            setFormData({
                roomId: editBooking.roomId,
                employeeId: editBooking.employeeId,
                title: editBooking.title,
                description: editBooking.description || '',
                startTime: new Date(editBooking.startTime),
                endTime: new Date(editBooking.endTime),
                attendees: editBooking.attendees || [],
                notes: editBooking.notes || '',
            });
        }
    }, [editBooking]);


    const findAlternativeSlots = (
        desiredStart: Date,
        desiredEnd: Date,
        existingBookings: Booking[]
    ): AvailabilitySlot[] => {
        const suggestedSlots: AvailabilitySlot[] = [];
        const duration = (desiredEnd.getTime() - desiredStart.getTime()) / (1000 * 60);
        const now = new Date();


        const baseDate = new Date(desiredStart);
        baseDate.setHours(8, 0, 0, 0);

        for (let hour = 8; hour <= 18; hour++) {
            const slotStart = new Date(baseDate);
            slotStart.setHours(hour, 0, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + duration);

            if (slotStart < now) continue;

            const conflicts = existingBookings.filter(booking => {
                if (editBooking && booking.id === editBooking.id) return false;
                const bStart = new Date(booking.startTime);
                const bEnd = new Date(booking.endTime);
                return slotEnd > bStart && slotStart < bEnd;
            });

            suggestedSlots.push({
                start: slotStart,
                end: slotEnd,
                available: conflicts.length === 0,
                conflicts,
            });
        }


        for (let day = 1; day <= 3; day++) {
            const date = new Date(desiredStart);
            date.setDate(date.getDate() + day);
            date.setHours(10, 0, 0, 0);

            const slotStart = new Date(date);
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + duration);

            const conflicts = existingBookings.filter(booking => {
                if (editBooking && booking.id === editBooking.id) return false;
                const bStart = new Date(booking.startTime);
                const bEnd = new Date(booking.endTime);
                return slotEnd > bStart && slotStart < bEnd;
            });

            suggestedSlots.push({
                start: slotStart,
                end: slotEnd,
                available: conflicts.length === 0,
                conflicts,
            });
        }

        return suggestedSlots.sort((a, b) => {
            if (a.available && !b.available) return -1;
            if (!a.available && b.available) return 1;
            return a.start.getTime() - b.start.getTime();
        });
    };


    const checkAvailability = useCallback(
        debounce(async (roomId: string, start: Date, end: Date) => {
            if (!roomId || !start || !end || start >= end) {
                setAvailabilityCheck(null);
                return;
            }

            setIsCheckingAvailability(true);
            try {
                const roomBookings = getBookingsForRoom(roomId);
                const conflicts = roomBookings.filter(booking => {
                    if (editBooking && booking.id === editBooking.id) return false;
                    const bStart = new Date(booking.startTime);
                    const bEnd = new Date(booking.endTime);
                    return end > bStart && start < bEnd;
                });


                const suggestedSlots = findAlternativeSlots(start, end, roomBookings);

                setAvailabilityCheck({
                    available: conflicts.length === 0,
                    conflicts,
                    suggestedSlots: suggestedSlots.slice(0, 3),
                });
            } catch (error) {
                console.error('Availability check failed:', error);
            } finally {
                setIsCheckingAvailability(false);
            }
        }, 500),
        [getBookingsForRoom, editBooking]
    );


    useEffect(() => {
        if (formData.roomId && formData.startTime && formData.endTime) {
            checkAvailability(formData.roomId, formData.startTime, formData.endTime);
        }
    }, [formData.roomId, formData.startTime, formData.endTime, checkAvailability]);


    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const now = new Date();


        if (activeStep === 0) {
            if (!formData.roomId) newErrors.roomId = 'Room is required';
            if (!formData.employeeId) newErrors.employeeId = 'Organizer is required';
            if (!formData.title.trim()) newErrors.title = 'Title is required';
            if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters';
        }


        if (activeStep === 1) {
            if (formData.startTime >= formData.endTime) {
                newErrors.endTime = 'End time must be after start time';
            }

            if (formData.startTime < now) {
                newErrors.startTime = 'Cannot book in the past';
            }

            const duration = (formData.endTime.getTime() - formData.startTime.getTime()) / (1000 * 60);
            if (duration < 15) {
                newErrors.duration = 'Meeting must be at least 15 minutes';
            }
            if (duration > 480) {
                newErrors.duration = 'Meeting cannot exceed 8 hours';
            }

            if (formData.attendees.length > 20) {
                newErrors.attendees = 'Maximum 20 attendees allowed';
            }


            if (availabilityCheck && !availabilityCheck.available) {
                newErrors.availability = 'Room is not available for the selected time slot';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        setSubmitError(null);

        try {
            const bookingData = {
                ...formData,
                startTime: formData.startTime.toISOString(),
                endTime: formData.endTime.toISOString(),
                status: BookingStatus.CONFIRMED,
                requiresEquipment: [],
            };

            if (editBooking) {
                await updateBooking(editBooking.id, bookingData);
            } else {
                await createBooking(bookingData as any);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            setSubmitError((error as Error).message);
            setActiveStep(0);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (field: string, value: any) => {
        setFormData((prev) => ({...prev, [field]: value}));
        setTouched((prev) => ({...prev, [field]: true}));
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return renderBasicInfo();
            case 1:
                return renderTimeAndAttendees();
            case 2:
                return renderReview();
            default:
                return null;
        }
    };

    const renderBasicInfo = () => (
        <Grid container spacing={2} sx={{mt: 1}}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Meeting Title *"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    error={!!errors.title && touched.title}
                    helperText={touched.title && errors.title}
                    disabled={loading}
                    required
                    inputProps={{maxLength: 100}}
                />
            </Grid>

            <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.roomId && touched.roomId} disabled={loading}>
                    <InputLabel>Room *</InputLabel>
                    <Select
                        value={formData.roomId}
                        onChange={(e) => handleFieldChange('roomId', e.target.value)}
                        label="Room *"
                    >
                        {rooms.map((room) => (
                            <MenuItem key={room.id} value={room.id}>
                                {room.name} (Capacity: {room.capacity})
                            </MenuItem>
                        ))}
                    </Select>
                    {touched.roomId && errors.roomId && (
                        <FormHelperText>{errors.roomId}</FormHelperText>
                    )}
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.employeeId && touched.employeeId} disabled={loading}>
                    <InputLabel>Organizer *</InputLabel>
                    <Select
                        value={formData.employeeId}
                        onChange={(e) => handleFieldChange('employeeId', e.target.value)}
                        label="Organizer *"
                    >
                        {employees.map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                                {emp.name} - {emp.department}
                            </MenuItem>
                        ))}
                    </Select>
                    {touched.employeeId && errors.employeeId && (
                        <FormHelperText>{errors.employeeId}</FormHelperText>
                    )}
                </FormControl>
            </Grid>

            <Grid item xs={12}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    disabled={loading}
                />
            </Grid>
        </Grid>
    );

    const renderTimeAndAttendees = () => (
        <Grid container spacing={2} sx={{mt: 1}}>
            <Grid item xs={12} sm={6}>
                <DateTimePicker
                    label="Start Time *"
                    value={formData.startTime}
                    onChange={(value) => value && handleFieldChange('startTime', value)}
                    disabled={loading}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            error: !!errors.startTime && touched.startTime,
                            helperText: touched.startTime && errors.startTime,
                            required: true,
                        },
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={6}>
                <DateTimePicker
                    label="End Time *"
                    value={formData.endTime}
                    onChange={(value) => value && handleFieldChange('endTime', value)}
                    disabled={loading}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            error: !!errors.endTime && touched.endTime,
                            helperText: touched.endTime && errors.endTime,
                            required: true,
                        },
                    }}
                />
            </Grid>

            {errors.duration && (
                <Grid item xs={12}>
                    <Alert severity="warning">{errors.duration}</Alert>
                </Grid>
            )}

            {isCheckingAvailability && (
                <Grid item xs={12}>
                    <Alert severity="info">
                        <CircularProgress size={16} sx={{mr: 1}}/>
                        Checking availability...
                    </Alert>
                </Grid>
            )}

            {availabilityCheck && !isCheckingAvailability && (
                <Grid item xs={12}>
                    {availabilityCheck.available ? (
                        <Alert severity="success">
                            ✓ Room is available for the selected time slot
                        </Alert>
                    ) : (
                        <Alert severity="error">
                            <Typography variant="body2" fontWeight="bold">
                                Room is not available. There are {availabilityCheck.conflicts.length} conflicting
                                booking(s).
                            </Typography>
                            {availabilityCheck.conflicts.map(conflict => (
                                <Typography key={conflict.id} variant="caption" display="block" sx={{mt: 0.5}}>
                                    • {conflict.title} ({new Date(conflict.startTime).toLocaleTimeString()} - {new Date(conflict.endTime).toLocaleTimeString()})
                                </Typography>
                            ))}
                        </Alert>
                    )}

                    {!availabilityCheck.available && availabilityCheck.suggestedSlots && availabilityCheck.suggestedSlots.length > 0 && (
                        <Box sx={{mt: 2}}>
                            <Typography variant="subtitle2" gutterBottom>
                                Suggested alternative slots:
                            </Typography>
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                {availabilityCheck.suggestedSlots.map((slot, index) => (
                                    <Paper
                                        key={index}
                                        sx={{
                                            p: 1.5,
                                            bgcolor: slot.available ? 'success.light' : 'grey.200',
                                            cursor: slot.available ? 'pointer' : 'default',
                                            opacity: slot.available ? 1 : 0.6,
                                            '&:hover': slot.available ? {
                                                bgcolor: 'success.main',
                                                color: 'white',
                                            } : {},
                                        }}
                                        onClick={() => {
                                            if (slot.available) {
                                                handleFieldChange('startTime', slot.start);
                                                handleFieldChange('endTime', slot.end);
                                            }
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {slot.available ? '✓' : '✗'} {slot.start.toLocaleString()} - {slot.end.toLocaleString()}
                                            {slot.available && (
                                                <Chip
                                                    label="Click to select"
                                                    size="small"
                                                    color="primary"
                                                    sx={{ml: 1}}
                                                />
                                            )}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Grid>
            )}

            {errors.availability && (
                <Grid item xs={12}>
                    <Alert severity="error">{errors.availability}</Alert>
                </Grid>
            )}

            <Grid item xs={12}>
                <FormControl fullWidth disabled={loading} error={!!errors.attendees}>
                    <InputLabel>Attendees</InputLabel>
                    <Select
                        multiple
                        value={formData.attendees}
                        onChange={(e) =>
                            handleFieldChange('attendees', e.target.value as string[])
                        }
                        label="Attendees"
                        renderValue={(selected) => (
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                {selected.map((id) => {
                                    const emp = employees.find((e) => e.id === id);
                                    return <Chip key={id} label={emp?.name || id} size="small"/>;
                                })}
                            </Box>
                        )}
                    >
                        {employees.map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                                {emp.name} - {emp.department}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.attendees && <FormHelperText>{errors.attendees}</FormHelperText>}
                </FormControl>
            </Grid>

            <Grid item xs={12}>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    disabled={loading}
                />
            </Grid>
        </Grid>
    );

    const renderReview = () => (
        <Box sx={{mt: 2}}>
            <Paper sx={{p: 2, mb: 2}}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Booking Summary
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                            Title
                        </Typography>
                        <Typography variant="body1">{formData.title}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                            Room
                        </Typography>
                        <Typography variant="body1">
                            {rooms.find(r => r.id === formData.roomId)?.name || 'Not selected'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                            Organizer
                        </Typography>
                        <Typography variant="body1">
                            {employees.find(e => e.id === formData.employeeId)?.name || 'Not selected'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                            Date & Time
                        </Typography>
                        <Typography variant="body1">
                            {formData.startTime.toLocaleString()} - {formData.endTime.toLocaleString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                            Attendees ({formData.attendees.length})
                        </Typography>
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5}}>
                            {formData.attendees.map(id => {
                                const emp = employees.find(e => e.id === id);
                                return <Chip key={id} label={emp?.name || id} size="small"/>;
                            })}
                        </Box>
                    </Grid>
                    {formData.description && (
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                                Description
                            </Typography>
                            <Typography variant="body2">{formData.description}</Typography>
                        </Grid>
                    )}
                    {formData.notes && (
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                                Notes
                            </Typography>
                            <Typography variant="body2">{formData.notes}</Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {availabilityCheck && availabilityCheck.available && (
                <Alert severity="success" icon={false}>
                    ✓ Room is available for this booking
                </Alert>
            )}
        </Box>
    );

    if (open && employees.length === 0) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogContent>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress/>
                        <Typography sx={{ml: 2}}>Loading...</Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    const steps = ['Basic Info', 'Time & Attendees', 'Review'];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {editBooking ? 'Edit Booking' : 'Create New Booking'}
            </DialogTitle>

            <DialogContent>
                {submitError && (
                    <Alert severity="error" sx={{mb: 2, mt: 1}}>
                        {submitError}
                    </Alert>
                )}

                <Stepper activeStep={activeStep} sx={{mb: 3}}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent(activeStep)}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                {activeStep > 0 && (
                    <Button onClick={handleBack} disabled={loading}>
                        Back
                    </Button>
                )}
                {activeStep < steps.length - 1 ? (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={loading}
                    >
                        Next
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || (availabilityCheck !== null && !availabilityCheck.available)}
                    >
                        {loading ? 'Saving...' : editBooking ? 'Update' : 'Create'} Booking
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default BookingForm;