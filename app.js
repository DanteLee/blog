var express = require('express');
var app = express();

var conf = require('./config');



/******************************************
 *
 * 第三方中间件
 *
 ******************************************/
var bodyParser = require('body-parser').urlencoded({ extended: true });
var fileparser = require('multer')().single('content');



/******************************************
 *
 * 应用中间件
 *
 ******************************************/
var article = require('./src/article-express');
var errorHandler = require('./src/error-express');
var markdown = require('./src/markdown-express');
var verify = require('./src/verify-express.js');
var pagebar = require('./src/page-express.js');

/******************************************
 *
 * TODO:启动预处理
 *
 ******************************************/
// 设置模板引擎jade
app.set('views', conf.path.template);
app.set('view engine', 'jade');



/******************************************
 *
 * 静态信息
 *
 ******************************************/
// 静态文件路由
app.use('/resource', express.static(
	conf.base+conf.path.static,
	{
		index: false
	}
));

// 添加公用中间件
// 添加错误处理
app.use(errorHandler);

/******************************************
 *
 * 文章模块
 *
 ******************************************/

// 查看文章
app.get('/article/view/:name',
	article.get,
	(req, res, next) => {
		res.render('view', {name: req.params.name, data: req.article});
	});

// 添加文章
app.get('/article/add',
	(req, res, next) => {
		res.render('add');
	});
app.post('/article/add',
	fileparser,
	markdown.parser,
	verify,
	article.add,
	(req, res, next) => {
		res.json({
			code: '0',
			msg: '文章添加成功',
			body: ''
		})
	});

// 编辑文章
app.get('/article/edit',
	(req, res, next) => {
		res.render('edit');
	},
	errorHandler);
app.post('/article/edit/:name',
	fileparser,
	markdown.parser,
	verify,
	article.edit,
	(req, res, next) => {
		res.json({
			code: '0',
			msg: '文章编辑成功',
			body: ''
		})
	});

// 删除文章
app.post('/article/del/:name',
	verify,
	article.del,
	(req, res, next) => {
		res.json({
			code: '0',
			msg: '文章删除成功',
			body: ''
		})
	});

// 文章列表
app.get('/article/:page(\\d+)?',
	pagebar
);


/******************************************
 *
 * 启动
 *
 ******************************************/
var server = app.listen(conf.server.port, function(){});
