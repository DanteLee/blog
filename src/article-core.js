'use strict';

var conf = require('../config');
var fs = require('fs');

/******************************************
 *
 * 初始化
 *
 ******************************************/
var base = `${conf.base}\/${conf.path.article}`;
var buffer = {};

// 将文章信息读入buffer
fs.readdirSync(base).forEach((item, i) => {
	if (fs.statSync(`${base}\/${item}`).isFile()) {
		buffer[item.replace(/.json$/i, '')] = require(`${base}\/${item}`);
	}
});

/******************************************
 *
 * 类：列表信息
 *
 ******************************************/
class List{
	constructor(buffer, size) {
		this.list = [];
		// 当前指针指向的新闻，不是页数
		this.curr = 0;
		this.size = typeof size === 'number' && size > 0 ? size : 1;
		this.done = false;

		var list = this.list;

		for (var name in buffer) {
			list.push({
				date: buffer[name].date,
				name: name
			});
		}

		list.sort((a, b) => {
			var dateA = (new Date(a.date)).getTime();
			var dateB = (new Date(b.date)).getTime();

			return dateA - dateB;
		});
	}

	// 提供一个列表迭代器，每次返回特定数量的文章摘要数目
	// {value: [], done: true/false}
	// value是列表结果，done代表迭代是否结束
	next() {
		if (this.done) {
			return {
				value: [],
				done: true
			}
		}

		var res = [];
		var curr = this.curr;

		for (var i = 0; i < this.size; i++) {
			var each = this.list[curr+i];

			if (each) {
				res.push(each);
			} else {
				break;
			}
		}

		this.curr = curr + i;

		if (this.curr >= this.list.length) {
			this.done = true;
			this.curr--;
		}

		return {
			value: res,
			done: this.done
		}
	}

	// 返回{page: int, curr: int, size: int}
	// page总页数，curr当前页数，size每页大小
	getInfo() {
		return {
			page: Math.ceil(this.list.length / this.size),
			curr: Math.ceil(this.curr / this.size) + 1,
			size: this.size
		}
	}
}


/******************************************
 *
 * 导出接口
 *
 ******************************************/
// 获取文章
exports.get = (name) => {
	// 判断是否存在
	if (!(name in buffer)) {
		return Promise.reject(404);
	}

	return Promise.resolve(buffer[name]);
};

// 添加文章
exports.add = (name, content) => {
	// 判断重名
	if (name in buffer) {
		return Promise.reject(403);
	}

	var data = {
		date: (new Date()).toUTCString(),
		content: content
	};
	var fullpath = `${base}\/${name}.json`;

	return (new Promise((resolve, reject) => {
		fs.writeFile(fullpath, JSON.stringify(data), 'utf8', (e) => {
			if (e) {
				reject(500);
			} else {
				resolve();
			}
		})
	})).then(() => {
		// 在buffer中添加文章信息
		buffer[name] = data;
	});
}

// 删除文章
exports.del = (name) => {
	// 判断文章是否存在
	if (!(name in buffer)) {
		return Promise.reject(404);
	}

	var fullpath = `${base}\/${name}.json`;

	return (new Promise((resolve, reject) => {
		fs.unlink(fullpath, (e) => {
			if (e) {
				reject(500);
			} else {
				resolve();
			}
		})
	})).then(() => {
		// 在buffer中删除文章信息
		buffer[name] = null;
	})
}

// 修改文章
exports.edit = (name, content) => {
	// 判断是否存在
	if (!(name in buffer)) {
		return Promise.reject(404);
	}

	var data = {
		date: (new Date()).toUTCString(),
		content: content
	};
	var fullpath = `${base}\/${name}.json`;

	return (new Promise((resolve, reject) => {
		fs.writeFile(fullpath, JSON.stringify(data), 'utf8', (e) => {
			if (e) {
				reject(500);
			} else {
				resolve(fullpath);
			}
		})
	})).then(() => {
		// 在buffer中添加文章信息
		buffer[name] = data;
	});
}

// 获取文章列表信息，返回一个迭代器
exports.getList = (size) => new List(buffer, size); 
exports.List = List;


