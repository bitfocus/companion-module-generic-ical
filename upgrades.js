module.exports = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	/*
	 * v1.0.0 -> v1.1.0
	 * - Added event window feedback
	 * - Enhanced recurring event handling
	 */
	function (context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		// No config changes needed
		if (props.config) {
			result.updatedConfig = { ...props.config }
		}

		// Update any existing actions if needed
		if (props.actions) {
			for (const action of props.actions) {
				// No action changes needed in this version
				result.updatedActions.push({ ...action })
			}
		}

		// Update any existing feedbacks if needed
		if (props.feedbacks) {
			for (const feedback of props.feedbacks) {
				if (feedback.type === 'eventActive') {
					// Update the eventActive feedback to include new options
					result.updatedFeedbacks.push({
						...feedback,
						options: {
							...feedback.options,
							// Add any new options with default values
							windowBefore: 5,
							windowAfter: 5,
						},
					})
				} else {
					// Keep other feedbacks as is
					result.updatedFeedbacks.push({ ...feedback })
				}
			}
		}

		return result
	},
]
