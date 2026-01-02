module.exports = function (self) {
	self.setActionDefinitions({
		refreshCalendar: {
			name: 'Refresh Calendar',
			options: [],
			callback: async () => {
				await self.setupIcalFeed()
			},
		},
		checkCurrentEvents: {
			name: 'Check Current Events',
			options: [],
			callback: async () => {
				const now = new Date()
				let foundActive = false

				for (const [, event] of self.events) {
					if (event.start <= now && event.end >= now) {
						foundActive = true
						self.updateEventVariables()
						const startTime = self.formatEventDateTime(event.start).time
						const endTime = self.formatEventDateTime(event.end).time
						self.log('info', `Current active event: ${event.summary} (${startTime} - ${endTime})`)
					}
				}

				if (!foundActive) {
					self.log('info', 'No active events found')
				}
			},
		},
	})
}
