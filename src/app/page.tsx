'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { SlotInfo } from 'react-big-calendar';
import Header from '@/components/Header';
import RoomCard from '@/components/RoomCard';
import DayCalendar from '@/components/DayCalendar';
import BookButton from '@/components/BookButton';
import BookingModal from '@/components/BookingModal';
import MeetingDetailModal from '@/components/MeetingDetailModal';
import RegistrationModal from '@/components/RegistrationModal';
import { Meeting, Attendee } from '@/components/EventCard';
import { AvatarFullConfig } from 'react-nice-avatar';

interface CurrentUser {
    name: string;
    department: string;
    avatarConfig: AvatarFullConfig;
}

// Get today and tomorrow dates
const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
};

// Sample data for demo
const initialMeetings: Meeting[] = [
    {
        id: '1',
        title: 'Weekly Sync - Marketing Team',
        start: new Date(getToday().getFullYear(), getToday().getMonth(), getToday().getDate(), 10, 0),
        end: new Date(getToday().getFullYear(), getToday().getMonth(), getToday().getDate(), 11, 30),
        attendees: [
            { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/100?img=1' },
            { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/100?img=2' },
            { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/100?img=3' },
            { id: '4', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/100?img=4' },
            { id: '5', name: 'Tom Brown', avatar: 'https://i.pravatar.cc/100?img=5' },
        ],
    },
];

export default function Home() {
    const today = getToday();
    const tomorrow = getTomorrow();

    const [currentDate, setCurrentDate] = useState<Date>(today);
    const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [pendingMeeting, setPendingMeeting] = useState<{ title: string; start: Date; end: Date } | null>(null);

    // Initial check for current user
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user', e);
            }
        }
    }, []);

    // Check if we can navigate
    const isToday = currentDate.toDateString() === today.toDateString();
    const isTomorrow = currentDate.toDateString() === tomorrow.toDateString();

    const canGoPrev = isTomorrow; // Can go back only if on tomorrow
    const canGoNext = isToday; // Can go forward only if on today

    const handlePrevDay = () => {
        if (canGoPrev) {
            setCurrentDate(today);
        }
    };

    const handleNextDay = () => {
        if (canGoNext) {
            setCurrentDate(tomorrow);
        }
    };

    const handleBookMeeting = () => {
        // Open modal without prefilling time
        setSelectedTime(null);
        setIsBookingModalOpen(true);
    };

    const handleSlotSelect = useCallback((slotInfo: SlotInfo) => {
        // Open booking modal with prefilled time from clicked slot
        setSelectedTime(slotInfo.start);
        setIsBookingModalOpen(true);
    }, []);

    const handleEventSelect = useCallback((meeting: Meeting) => {
        // Open detail modal with selected meeting
        setSelectedMeeting(meeting);
        setIsDetailModalOpen(true);
    }, []);

    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
        setSelectedTime(null);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedMeeting(null);
    };

    const handleConfirmBooking = (newMeeting: { title: string; start: Date; end: Date }) => {
        if (!currentUser) {
            // First time user - save the meeting and open registration
            setPendingMeeting(newMeeting);
            setIsBookingModalOpen(false);
            setIsRegistrationModalOpen(true);
            return;
        }

        finalizeBooking(newMeeting, currentUser);
    };

    const finalizeBooking = (newMeeting: { title: string; start: Date; end: Date }, user: CurrentUser) => {
        const meeting: Meeting = {
            id: `meeting-${Date.now()}`,
            title: newMeeting.title,
            start: newMeeting.start,
            end: newMeeting.end,
            attendees: [
                {
                    id: 'current-user',
                    name: user.name,
                    avatarConfig: user.avatarConfig
                }
            ],
        };

        setMeetings(prev => [...prev, meeting]);
    };

    const handleRegister = (user: { name: string; department: string; avatarConfig: AvatarFullConfig }) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setIsRegistrationModalOpen(false);

        if (pendingMeeting) {
            finalizeBooking(pendingMeeting, user);
            setPendingMeeting(null);
        }
    };

    // Filter meetings for current date
    const currentDateMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.start);
        return meetingDate.toDateString() === currentDate.toDateString();
    });


    return (
        <main className="page">
            <Header
                date={currentDate}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                onPrev={handlePrevDay}
                onNext={handleNextDay}
            />

            <RoomCard
                name="Operation 133"
                modelPath="/model.gltf"
            />

            <DayCalendar
                date={currentDate}
                events={currentDateMeetings}
                onSlotSelect={handleSlotSelect}
                onEventSelect={handleEventSelect}
            />

            <BookButton onClick={handleBookMeeting} />

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={handleCloseBookingModal}
                onBook={handleConfirmBooking}
                selectedTime={selectedTime}
                date={currentDate}
                existingMeetings={currentDateMeetings}
            />

            <RegistrationModal
                isOpen={isRegistrationModalOpen}
                onClose={() => setIsRegistrationModalOpen(false)}
                onRegister={handleRegister}
            />

            <MeetingDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                meeting={selectedMeeting}
            />
        </main>
    );
}
