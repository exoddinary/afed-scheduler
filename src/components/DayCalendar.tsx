'use client';

import React, { useMemo } from 'react';
import { Calendar, momentLocalizer, Views, EventProps, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventCard, { Meeting } from './EventCard';

const localizer = momentLocalizer(moment);

interface DayCalendarProps {
    date: Date;
    events: Meeting[];
    availableSlots?: number;
    onSlotSelect?: (slotInfo: SlotInfo) => void;
    onEventSelect?: (event: Meeting) => void;
}

// Custom event wrapper component
const CustomEvent = ({ event }: EventProps<Meeting>) => {
    return <EventCard event={event} />;
};

export default function DayCalendar({
    date,
    events,
    onSlotSelect,
    onEventSelect
}: DayCalendarProps) {
    // Convert Meeting[] to react-big-calendar event format
    const calendarEvents = useMemo(() => {
        return events.map(event => ({
            ...event,
            start: event.start,
            end: event.end,
            title: event.title,
        }));
    }, [events]);

    const handleSelectSlot = (slotInfo: SlotInfo) => {
        if (onSlotSelect) {
            onSlotSelect(slotInfo);
        }
    };

    const handleSelectEvent = (event: Meeting) => {
        if (onEventSelect) {
            onEventSelect(event);
        }
    };

    return (
        <div className="schedule-section">
            <div className="schedule-header">
                <h2 className="schedule-title">Schedule</h2>
            </div>

            <div className="calendar-wrapper">
                <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    date={date}
                    view={Views.DAY}
                    views={[Views.DAY]}
                    toolbar={false}
                    min={new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0, 0)}
                    max={new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0)}
                    step={30}
                    timeslots={2}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    components={{
                        event: CustomEvent,
                    }}
                    eventPropGetter={() => ({
                        style: {
                            backgroundColor: 'transparent',
                            border: 'none',
                        }
                    })}
                    dayLayoutAlgorithm="no-overlap"
                />
            </div>
        </div>
    );
}
