function handle_404(err, req, res, next) {
	res.render('error', {code: err, msg: '你要找的页面不存在了'});
} 

function handle_unknown(err, req, res, next) {
	res.render('error', {code: err, msg: '发生了未知错误T^T'});
}

module.exports = (err, req, res, next) => {
	switch (err) {
		case 404:
			handle_404(err, req, res, next);
			break;
		case 403: 
			handle_unknown(err, req, res, next);
			break;
		case 500:
			handle_unknown(err, req, res, next);
			break;
		default:
			handle_unknown(err, req, res, next);
	}
}