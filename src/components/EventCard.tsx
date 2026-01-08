import Avatar, { AvatarFullConfig } from 'react-nice-avatar';

export interface Attendee {
    id: string;
    name: string;
    avatar?: string;
    avatarConfig?: AvatarFullConfig;
}

export interface Meeting {
    id: string;
    ownerId?: string; // ID of the user who created it
    title: string;
    start: Date;
    end: Date;
    attendees: Attendee[];
}

interface EventCardProps {
    event: Meeting;
}

export default function EventCard({ event }: EventCardProps) {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const displayedAttendees = event.attendees.slice(0, 3);
    const remainingCount = event.attendees.length - 3;

    return (
        <div className="event-card">
            <div className="event-title">{event.title}</div>
            <div className="event-time">
                {formatTime(event.start)} - {formatTime(event.end)}
            </div>
            {event.attendees.length > 0 && (
                <div className="event-attendees">
                    <div className="attendee-avatars">
                        {displayedAttendees.map((attendee) => (
                            <div key={attendee.id} className="attendee-avatar-wrapper">
                                {attendee.avatarConfig ? (
                                    <Avatar className="attendee-avatar" {...attendee.avatarConfig} />
                                ) : (
                                    <img
                                        src={attendee.avatar}
                                        alt={attendee.name}
                                        className="attendee-avatar"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    {remainingCount > 0 && (
                        <span className="attendee-count">+{remainingCount} others</span>
                    )}
                </div>
            )}
        </div>
    );
}
