module.exports = function (self) {
	self.setFeedbackDefinitions({
		eventActive: {
			name: 'Event Active',
			type: 'boolean',
			label: 'Event Status',
			defaultStyle: {
				bgcolor: 0xff0000, // Red
				color: 0xffffff, // White
			},
			options: [],
			callback: (feedback) => {
				const now = new Date()

				// Check all events for any that are currently active
				for (const [, event] of self.events) {
					if (event.start <= now && event.end >= now) {
						return true
					}
				}
				return false
			},
		},
		eventWindow: {
			name: 'Event Time Window',
			type: 'boolean',
			label: 'Event Window Status',
			defaultStyle: {
				bgcolor: 0x00ff00, // Green
				color: 0x000000, // Black
			},
			options: [
				{
					type: 'number',
					label: 'Minutes Before',
					id: 'minutesBefore',
					default: 5,
					min: 0,
					max: 120,
				},
				{
					type: 'number',
					label: 'Minutes After',
					id: 'minutesAfter',
					default: 5,
					min: 0,
					max: 120,
				},
			],
			callback: (feedback) => {
				const now = new Date()
				const minutesBefore = feedback.options.minutesBefore || 5
				const minutesAfter = feedback.options.minutesAfter || 5

				// Check all events
				for (const [, event] of self.events) {
					const beforeWindow = new Date(event.start.getTime() - minutesBefore * 60 * 1000)
					const afterWindow = new Date(event.end.getTime() + minutesAfter * 60 * 1000)

					// Check if we're:
					// 1. In the window before the event OR
					// 2. During the event OR
					// 3. In the window after the event
					if (
						(now >= beforeWindow && now <= event.start) ||
						(now >= event.start && now <= event.end) ||
						(now >= event.end && now <= afterWindow)
					) {
						return true
					}
				}
				return false
			},
		},
	})
}
