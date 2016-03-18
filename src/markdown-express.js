'use strict';

var Markdown = require('markdown-it');
var md = new Markdown();

exports.parser = (req, res, next) => {
	var raw = req.file.buffer.toString('utf8');

	!req.body && (req.body = {});
	req.body.content = md.render(raw);

	next();
}