# Companion Module: iCal Scheduler

This module integrates iCal calendar feeds with Bitfocus Companion, allowing you to trigger actions based on calendar events.

## Configuration

1. **iCal Feed URL**: Enter the URL of your iCal feed (e.g., from Google Calendar, Outlook, etc.)
2. **Refresh Interval**: How often to check for calendar updates (1-1440 minutes)

## Features

### Variables
The following variables are available when events are active:

Current Event:
- `$(ical-scheduler:event_name)` - Event name (shows "Nothing Scheduled" when no event is active)
- `$(ical-scheduler:event_start_date)` - Event start date (YYYY-MM-DD)
- `$(ical-scheduler:event_start_time)` - Event start time (HH:MM)
- `$(ical-scheduler:event_end_date)` - Event end date (YYYY-MM-DD)
- `$(ical-scheduler:event_end_time)` - Event end time (HH:MM)

Next Event:
- `$(ical-scheduler:next_event_name)` - Next event name
- `$(ical-scheduler:next_event_start_date)` - Next event start date (YYYY-MM-DD)
- `$(ical-scheduler:next_event_start_time)` - Next event start time (HH:MM)
- `$(ical-scheduler:next_event_end_date)` - Next event end date (YYYY-MM-DD)
- `$(ical-scheduler:next_event_end_time)` - Next event end time (HH:MM)

### Actions
- **Refresh Calendar**: Manually refresh the iCal feed
- **Check Current Events**: Check and log any currently active events

### Feedbacks
- **Event Active**: Changes color when there is a currently active event

## Support

For help and discussions about this module, please visit:
https://github.com/crackley/companion-module-generic-ical/issues
