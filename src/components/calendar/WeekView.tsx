import React, { useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Tooltip,
    Chip,
    alpha,
} from '@mui/material';
import { format, isToday, getHours, getMinutes } from 'date-fns';
import { Booking, BookingStatus } from '../../domain/entities/Booking';

interface WeekViewProps {
    days: Date[];
    getBookingsForDay: (date: Date) => Booking[];
    onBookingClick: (booking: Booking) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const MINUTES_PER_HOUR = 60;
const TOTAL_HEIGHT = 720;

interface BookingPosition {
    top: number;
    height: number;
    left: number;
    width: number;
    zIndex: number;
    isOverlapping: boolean;
    overlapIndex: number;
    totalOverlaps: number;
}

interface BookingWithOverlap extends Booking {
    _overlapInfo?: {
        totalOverlaps: number;
        overlapIndex: number;
        groupSize: number;
    };
}

const WeekView: React.FC<WeekViewProps> = ({
                                               days,
                                               getBookingsForDay,
                                               onBookingClick,
                                           }) => {
    const getBookingPosition = (booking: Booking): BookingPosition => {
        const start = new Date(booking.startTime);
        const end = new Date(booking.endTime);
        const startMinutes = getHours(start) * MINUTES_PER_HOUR + getMinutes(start);
        const endMinutes = getHours(end) * MINUTES_PER_HOUR + getMinutes(end);
        const durationMinutes = endMinutes - startMinutes;

        return {
            top: (startMinutes - 8 * MINUTES_PER_HOUR),
            height: Math.max(durationMinutes, 30),
            left: 0,
            width: 100,
            zIndex: 1,
            isOverlapping: false,
            overlapIndex: 0,
            totalOverlaps: 1,
        };
    };

    const processOverlaps = (bookings: Booking[]): BookingWithOverlap[] => {
        if (bookings.length === 0) return bookings;

        const sorted = [...bookings].sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const overlapGroups: Booking[][] = [];
        let currentGroup: Booking[] = [];

        sorted.forEach((booking, index) => {
            if (currentGroup.length === 0) {
                currentGroup.push(booking);
                return;
            }

            const lastBooking = currentGroup[currentGroup.length - 1];
            const lastEnd = new Date(lastBooking.endTime);
            const currentStart = new Date(booking.startTime);

            if (currentStart < lastEnd) {
                currentGroup.push(booking);
            } else {
                overlapGroups.push(currentGroup);
                currentGroup = [booking];
            }

            if (index === sorted.length - 1 && currentGroup.length > 0) {
                overlapGroups.push(currentGroup);
            }
        });

        const processedBookings: BookingWithOverlap[] = [];
        overlapGroups.forEach(group => {
            if (group.length === 1) {
                processedBookings.push(group[0]);
                return;
            }

            group.forEach((booking, index) => {

                const processed: BookingWithOverlap = {
                    ...booking,
                    _overlapInfo: {
                        totalOverlaps: group.length,
                        overlapIndex: index,
                        groupSize: group.length,
                    }
                };
                processedBookings.push(processed);
            });
        });

        return processedBookings;
    };

    const getBookingStyle = (booking: BookingWithOverlap): React.CSSProperties => {
        const position = getBookingPosition(booking);
        const overlapInfo = booking._overlapInfo;

        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            borderRadius: 4,
            padding: '2px 4px',
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
        };

        if (overlapInfo && overlapInfo.totalOverlaps > 1) {
            const totalWidth = 100 / overlapInfo.totalOverlaps;
            const leftOffset = overlapInfo.overlapIndex * totalWidth;

            return {
                ...baseStyle,
                left: `${leftOffset + 0.5}%`,
                width: `calc(${totalWidth - 0.5}%)`,
                top: position.top,
                height: Math.max(position.height, 30),
                backgroundColor: booking.status === BookingStatus.CANCELLED
                    ? alpha('#f44336', 0.7)
                    : alpha('#1976d2', 0.85 + (overlapInfo.overlapIndex * 0.05)),
                zIndex: 10 + overlapInfo.overlapIndex,
                border: `1px solid ${booking.status === BookingStatus.CANCELLED
                    ? '#d32f2f'
                    : '#1565c0'}`,
            };
        }

        return {
            ...baseStyle,
            left: '0.5%',
            width: '99%',
            top: position.top,
            height: Math.max(position.height, 30),
            backgroundColor: booking.status === BookingStatus.CANCELLED
                ? '#ffcdd2'
                : '#bbdefb',
            zIndex: 1,
            border: `1px solid ${booking.status === BookingStatus.CANCELLED
                ? '#ef9a9a'
                : '#90caf9'}`,
        };
    };

    const processedDays = useMemo(() => {
        return days.map(day => {
            const dayBookings = getBookingsForDay(day);
            return {
                date: day,
                bookings: processOverlaps(dayBookings),
            };
        });
    }, [days, getBookingsForDay]);

    const getCurrentTimePosition = (): number => {
        const now = new Date();
        const minutes = getHours(now) * MINUTES_PER_HOUR + getMinutes(now);
        return (minutes - 8 * MINUTES_PER_HOUR);
    };

    return (
        <Paper sx={{ p: 2, overflowX: 'auto' }}>
            <Grid container>
                {}
                <Grid item xs={1} sx={{ minWidth: 60 }}>
                    <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider' }} />
                    {HOURS.map((hour) => (
                        <Box
                            key={hour}
                            sx={{
                                height: 60,
                                borderBottom: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                {format(new Date().setHours(hour), 'h a')}
                            </Typography>
                        </Box>
                    ))}
                </Grid>

                {}
                {processedDays.map(({ date, bookings }) => (
                    <Grid item xs key={date.toISOString()} sx={{ minWidth: 120 }}>
                        {}
                        <Box
                            sx={{
                                height: 60,
                                borderBottom: 1,
                                borderColor: 'divider',
                                bgcolor: isToday(date) ? 'action.selected' : 'transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                {format(date, 'EEE')}
                            </Typography>
                            <Typography variant="h6">
                                {format(date, 'd')}
                            </Typography>
                            {isToday(date) && (
                                <Chip label="Today" size="small" color="primary" sx={{ mt: 0.5, height: 20 }} />
                            )}
                        </Box>

                        {}
                        <Box sx={{ position: 'relative', height: TOTAL_HEIGHT }}>
                            {}
                            {HOURS.map((hour, index) => (
                                <Box
                                    key={`${date}-${hour}`}
                                    sx={{
                                        height: 60,
                                        borderBottom: index < HOURS.length - 1 ? 1 : 0,
                                        borderColor: 'divider',
                                        borderLeft: 1,
                                        position: 'relative',
                                        '&:nth-of-type(even)': {
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                >
                                    {}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: 0,
                                            right: 0,
                                            height: 1,
                                            bgcolor: 'divider',
                                            opacity: 0.3,
                                        }}
                                    />
                                </Box>
                            ))}

                            {}
                            {isToday(date) && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: getCurrentTimePosition(),
                                        height: 2,
                                        bgcolor: 'error.main',
                                        zIndex: 100,
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: -4,
                                            top: -4,
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: 'error.main',
                                        },
                                    }}
                                />
                            )}

                            {/* Bookings */}
                            {bookings.map((booking) => {
                                const style = getBookingStyle(booking);
                                const overlapInfo = booking._overlapInfo;

                                return (
                                    <Tooltip
                                        key={booking.id}
                                        title={
                                            <Box>
                                                <Typography variant="subtitle2">{booking.title}</Typography>
                                                <Typography variant="caption" display="block">
                                                    {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                                                </Typography>
                                                {overlapInfo && overlapInfo.totalOverlaps > 1 && (
                                                    <Typography variant="caption" color="warning.main">
                                                        ⚠ {overlapInfo.totalOverlaps} overlapping bookings
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    >
                                        <Box
                                            sx={{
                                                ...style,
                                                '&:hover': {
                                                    transform: 'scale(1.02)',
                                                    zIndex: 20,
                                                    boxShadow: 3,
                                                    backgroundColor: booking.status === BookingStatus.CANCELLED
                                                        ? '#ef5350'
                                                        : '#1976d2',
                                                    color: 'white',
                                                },
                                            }}
                                            onClick={() => onBookingClick(booking)}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.6rem',
                                                    fontWeight: 'bold',
                                                    display: 'block',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {booking.title}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.5rem',
                                                    display: 'block',
                                                    opacity: 0.8,
                                                }}
                                            >
                                                {format(new Date(booking.startTime), 'h:mm')}-
                                                {format(new Date(booking.endTime), 'h:mm')}
                                            </Typography>
                                            {overlapInfo && overlapInfo.totalOverlaps > 1 && (
                                                <Chip
                                                    label={`${overlapInfo.overlapIndex + 1}/${overlapInfo.totalOverlaps}`}
                                                    size="small"
                                                    sx={{
                                                        height: 16,
                                                        fontSize: '0.4rem',
                                                        mt: 0.5,
                                                        bgcolor: 'rgba(255,255,255,0.3)',
                                                    }}
                                                />
                                            )}
                                            {booking.status === BookingStatus.CANCELLED && (
                                                <Chip
                                                    label="Cancelled"
                                                    size="small"
                                                    color="error"
                                                    sx={{
                                                        height: 16,
                                                        fontSize: '0.4rem',
                                                        mt: 0.5,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Tooltip>
                                );
                            })}

                            {}
                            {bookings.length === 0 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center',
                                        color: 'text.secondary',
                                    }}
                                >
                                    <Typography variant="caption">
                                        No bookings
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default WeekView;