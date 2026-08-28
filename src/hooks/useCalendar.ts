import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    startOfDay,
    endOfDay,
    format,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    isSameDay,
    isWithinInterval,
} from 'date-fns';
import { useBookingStore } from '../stores/bookingStore';
import { Booking, BookingStatus } from '../domain/entities/Booking';

export type CalendarView = 'day' | 'week';

export function useCalendar() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [view, setView] = useState<CalendarView>(() => {
        const viewParam = searchParams.get('view') as CalendarView;
        return viewParam === 'day' || viewParam === 'week' ? viewParam : 'week';
    });

    const [currentDate, setCurrentDate] = useState(() => {
        const dateParam = searchParams.get('date');
        return dateParam ? new Date(dateParam) : new Date();
    });

    const { bookings } = useBookingStore();

    const days = useMemo(() => {
        if (view === 'day') {
            return [currentDate];
        }
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [view, currentDate]);

    const getBookingsForDay = (date: Date): Booking[] => {
        const start = startOfDay(date);
        const end = endOfDay(date);

        return bookings
            .filter(b => {
                const bDate = new Date(b.startTime);

                return isWithinInterval(bDate, { start, end }) &&
                    b.status !== BookingStatus.CANCELLED &&
                    b.status === BookingStatus.CONFIRMED;
            })
            .sort((a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );
    };

    const getBookingsForDayByRoom = (date: Date, roomId: string): Booking[] => {
        const dayBookings = getBookingsForDay(date);
        return dayBookings.filter(b => b.roomId === roomId);
    };

    const updateUrl = (newView: CalendarView, newDate: Date) => {
        setSearchParams({
            view: newView,
            date: format(newDate, 'yyyy-MM-dd')
        });
    };

    const handleSetView = (newView: CalendarView) => {
        setView(newView);
        updateUrl(newView, currentDate);
    };

    const navigate = (direction: 'prev' | 'next') => {
        let newDate;
        if (view === 'day') {
            newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
        } else {
            newDate = direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1);
        }
        setCurrentDate(newDate);
        updateUrl(view, newDate);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        updateUrl(view, today);
    };

    return {
        view,
        setView: handleSetView,
        currentDate,
        days,
        getBookingsForDay,
        getBookingsForDayByRoom,
        navigate,
        goToToday,
        formattedDate: format(currentDate, view === 'day' ? 'EEEE, MMMM d, yyyy' : 'MMMM yyyy'),
        isToday: isSameDay(currentDate, new Date())
    };
}