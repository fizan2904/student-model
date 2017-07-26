var router = require('express').Router();
	Exam = require('../../models/exam'),
	User = require('../../models/user');

var ensureAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect('/login');
	}
}

router.get('/', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		teacher = req.session.passport.user.teacher;
	if(!teacher){
		User.getUserByUsername(username, (err, user) => {
			if(err) throw err;
			if(user){
				Exam.findExamForStudent(user.year, user.dept, (err, exams) => {
					var Subjects = [];
					for(var i=0;i<exams.length;i++){
						if(!Subjects.includes(exams[i].subject)){
							Subjects.push(exams[i].subject);
						}
					}
					res.render('subSel.html', {
						teacher : teacher,
						data : Subjects
					});
				});
			}
		});
	}else{
		Exam.findExamsByUsername(username, (err, allExams) => {
			if(err) throw err;
			var examDetails = [];
			for(var i=0;i<allExams.length;i++){
				examDetails.push({
					exam_name : allExams[i].exam_name,
					year : allExams[i].year,
					dept : allExams[i].dept,
					subject : allExams[i].subject
				});
			}
			console.log(examDetails);
			res.render('subSel.html', {
				teacher : teacher,
				data : examDetails
			});
		});
	}
});

module.exports = router;