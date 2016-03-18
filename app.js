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

// for parsing application/json
//app.use(bodyParser.json()); 
// for parsing application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true })); 
// for parsing multipart/form-data
//app.use(multer()); 

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
	},
	errorHandler);

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
	},
	errorHandler);

// 编辑文章

// 删除文章


/******************************************
 *
 * 启动
 *
 ******************************************/
var server = app.listen(conf.server.port, function(){});