var router = require('express').Router(),
	User = require('../models/user');

var ensureAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('please login');
		res.redirect('/login');
	}
}

router.route('/')

	.get(ensureAuth, (req, res) => {
		User.getUserByUsername(req.session.passport.user.username, (err, userData) => {
			if(req.session.passport.user.teacher){
				res.render('teacher_dash.html', {
					userData : userData
				});
			}else{
				res.render('student_dash.html', {
					userData : userData
				});
			}
		});
	});

module.exports = router;