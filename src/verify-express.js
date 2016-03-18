var process = require('process');

var key = process.argv[3];

module.exports = (req, res, next) => {
	if (!key) {
		next();
	} else if (req.body.key === key) {
		next();
	} else {
		next(403);
	}
}