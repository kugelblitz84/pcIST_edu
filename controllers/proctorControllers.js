import ProctorEvent from '../models/ProctorEvent.js';

// Fetch proctoring events with optional filters (attemptId, eventType) and basic pagination.
const getAllEvents = async (req, res) => {
	try {
		const { attemptId, eventType, limit = 50, skip = 0 } = req.query;
		const filter = {};

		if (attemptId) filter.attempt = attemptId;
		if (eventType) filter.eventType = eventType;

		const events = await ProctorEvent.find(filter)
			.sort({ createdAt: -1 })
			.skip(Number(skip))
			.limit(Math.min(Number(limit), 200));

		res.status(200).json({ events });
	} catch (error) {
		console.error('Error fetching proctor events:', error);
		res.status(500).json({ message: 'Server error while retrieving proctor events.' });
	}
};

export { getAllEvents };
