module.exports = function (self) {
	self.setFeedbackDefinitions({
		eventActive: {
			name: 'Event Active',
			type: 'boolean',
			label: 'Event Status',
			defaultStyle: {
				bgcolor: 0xFF0000, // Red
				color: 0xFFFFFF,   // White
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
	})
}
