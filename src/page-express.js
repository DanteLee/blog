var getPageNum = require('./article-express').getPageNum;
var pageAt = require('./article-express').pageAt;

module.exports = (req, res, next) => {
    var curr = req.params.page;
    var total = getPageNum();

    if (!curr) {
        req.params.page = curr = 1;
    }

    if (curr > total) {
        next(404);
    }

    res.render('list', {total: total, curr: curr, list: pageAt(curr)});
}
