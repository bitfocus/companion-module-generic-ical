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
			callback: async (action) => {
				const now = new Date()
				let foundActive = false

				for (const [, event] of self.events) {
					if (event.start <= now && event.end >= now) {
						foundActive = true
						self.updateEventVariables()
						const startTime = event.start.toLocaleTimeString('en-US', {
							hour12: false,
							hour: '2-digit',
							minute: '2-digit',
						})
						const endTime = event.end.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
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
