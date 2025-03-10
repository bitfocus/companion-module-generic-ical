const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const ical = require('node-ical')
const schedule = require('node-schedule')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.scheduleJobs = new Map()
		this.events = new Map()
		this.activeCheckInterval = null
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Ok)

		if (this.config.icalUrl) {
			await this.setupIcalFeed()
		}

		// Start checking for active events periodically
		this.startActiveEventCheck()

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
	}

	async destroy() {
		this.log('debug', 'destroy')
		// Cancel all scheduled jobs
		for (const job of this.scheduleJobs.values()) {
			job.cancel()
		}
		this.scheduleJobs.clear()
		this.events.clear()

		// Clear the active event check interval
		if (this.activeCheckInterval) {
			clearInterval(this.activeCheckInterval)
			this.activeCheckInterval = null
		}
	}

	startActiveEventCheck() {
		// Clear any existing interval
		if (this.activeCheckInterval) {
			clearInterval(this.activeCheckInterval)
		}

		// Check every 30 seconds for active events and update feedback
		this.activeCheckInterval = setInterval(() => {
			this.checkFeedbackState()
			this.updateEventVariables()
		}, 30000) // 30 seconds

		// Initial check
		this.checkFeedbackState()
		this.updateEventVariables()
	}

	checkFeedbackState() {
		// This will trigger all feedback to be recalculated
		this.checkFeedbacks('eventActive')
	}

	formatEventDateTime(date) {
		if (!date) return { date: '', time: '' }
		
		// Format date as YYYY-MM-DD
		const dateStr = date.toISOString().split('T')[0]
		
		// Format time as HH:MM (24-hour format)
		const timeStr = date.toLocaleTimeString('en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
		})

		return { date: dateStr, time: timeStr }
	}

	updateEventVariables() {
		const now = new Date()
		let currentEvent = null
		let nextEvent = null
		
		// Find current and next events
		for (const [, event] of this.events) {
			// Check for current event
			if (event.start <= now && event.end >= now) {
				currentEvent = event
			}
			// Check for next event
			else if (event.start > now) {
				if (!nextEvent || event.start < nextEvent.start) {
					nextEvent = event
				}
			}
		}

		// Update current event variables
		const variables = {
			event_name: 'Nothing Scheduled',
			event_start_date: '',
			event_start_time: '',
			event_end_date: '',
			event_end_time: '',
			next_event_name: '',
			next_event_start_date: '',
			next_event_start_time: '',
			next_event_end_date: '',
			next_event_end_time: '',
		}

		if (currentEvent) {
			const startDateTime = this.formatEventDateTime(currentEvent.start)
			const endDateTime = this.formatEventDateTime(currentEvent.end)

			variables.event_name = currentEvent.summary || ''
			variables.event_start_date = startDateTime.date
			variables.event_start_time = startDateTime.time
			variables.event_end_date = endDateTime.date
			variables.event_end_time = endDateTime.time
		}

		if (nextEvent) {
			const startDateTime = this.formatEventDateTime(nextEvent.start)
			const endDateTime = this.formatEventDateTime(nextEvent.end)

			variables.next_event_name = nextEvent.summary || ''
			variables.next_event_start_date = startDateTime.date
			variables.next_event_start_time = startDateTime.time
			variables.next_event_end_date = endDateTime.date
			variables.next_event_end_time = endDateTime.time
		}

		this.setVariableValues(variables)
	}

	async configUpdated(config) {
		this.config = config
		// Reset and reload events when config changes
		for (const job of this.scheduleJobs.values()) {
			job.cancel()
		}
		this.scheduleJobs.clear()
		this.events.clear()

		if (this.config.icalUrl) {
			await this.setupIcalFeed()
		}

		// Restart the active event check
		this.startActiveEventCheck()
	}

	async setupIcalFeed() {
		try {
			// Convert webcal:// to https://
			const feedUrl = this.config.icalUrl.replace(/^webcal:\/\//i, 'https://')
			this.log('debug', `Fetching calendar from: ${feedUrl}`)
			
			const events = await ical.fromURL(feedUrl)
			this.updateStatus(InstanceStatus.Ok)
			
			for (const [, event] of Object.entries(events)) {
				if (event.type !== 'VEVENT') continue

				const now = new Date()
				// Skip past events
				if (event.end < now) continue

				this.events.set(event.uid, event)
				
				// Schedule start action
				if (event.start > now) {
					const startJob = schedule.scheduleJob(event.start, () => {
						this.handleEventStart(event)
					})
					this.scheduleJobs.set(`start_${event.uid}`, startJob)
				}

				// Schedule end action
				if (event.end > now) {
					const endJob = schedule.scheduleJob(event.end, () => {
						this.handleEventEnd(event)
					})
					this.scheduleJobs.set(`end_${event.uid}`, endJob)
				}
			}

			// Update variables and feedback state after loading events
			this.updateEventVariables()
			this.checkFeedbackState()
		} catch (error) {
			this.log('error', 'Failed to fetch iCal feed: ' + error.toString())
			this.updateStatus(InstanceStatus.Error, error.toString())
		}
	}

	handleEventStart(event) {
		this.log('info', `Event started: ${event.summary}`)
		this.updateEventVariables()
		this.checkFeedbackState()
	}

	handleEventEnd(event) {
		this.log('info', `Event ended: ${event.summary}`)
		this.updateEventVariables()
		this.checkFeedbackState()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'icalUrl',
				label: 'iCal Feed URL (supports webcal:// or https://)',
				width: 12,
				regex: Regex.URL,
			},
			{
				type: 'number',
				id: 'refreshInterval',
				label: 'Refresh Interval (minutes)',
				width: 6,
				min: 1,
				max: 1440,
				default: 15,
			}
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
