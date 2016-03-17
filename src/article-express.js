'use strict';

var get = require('./article-core').get,
	add = require('./article-core').add,
	del = require('./article-core').del,
	edit = require('./article-core').edit,
	getList = (size) => {
		var list = require('./article-core').getList(size);
		var pages = [];
		var ret = list.next();

		while (!ret.done || ret.value.length > 0) {
			pages.push(ret.value);
			ret = list.next();
		} 

		return pages;
	}

var conf = require('../config'); 
var list = getList(conf.env.pageSize);

// 当文章状态发生变化时（增删改查），进行一些状态维护
function refresh() {
	list = getList(conf.env.pageSize);
}

exports.get = (req, res, next) => {
	var name = res.params.name;

	get(name).then((data) => {
		req.article = data;
		next();
	}, (code) => {
		// code: 404
		next(404);
	});
}

// 使用POST
exports.add = (req, res, next) => {
	var name = res.params.name;
	var content = res.body.content;

	add(name, content).then(() => {
		// 更新页面列表信息
		refresh();
		next();
	}, (code) => {
		// code: 403 500
		next(code);
	});
}

exports.del = (req, res, next) => {
	var name = res.params.name;

	del(name).then(() => {
		// 更新页面列表信息
		refresh();
		next();
	}, (code) => {
		// code: 404 500
		next(code)
	})
}

exports.edit = (req, res, next) => {
	var name = res.params.name;
	var content = res.body.content;

	edit(name, content).then(() => {
		next();
	}, (code) => {
		// code: 404 500
		next(code);
	});
}

// 分页相关
exports.pageAt = (page) => {
	var total = this.getPageNum();

	if (page > total) {
		return -1;
	} else {
		return list[page-1];
	}
}
exports.getPageNum = () => list.length;
