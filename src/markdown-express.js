'use strict';

var md = require('markdown').markdown;

exports.parser = (req, res, next) => {
	var raw = req.body.content;

	req.body.content = md.toHTML(raw);
	req.body._rawContent = raw;

	next();
}