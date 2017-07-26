var router = require('express').Router(),
	Exam = require('../../models/exam'),
	Score = require('../../models/score'),
	User = require('../../models/user');

var ensureAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('Error_msg', 'Please login');
		res.redirect('/login');
	}
}

router.get('/', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		teacher = req.session.passport.user.teacher;
	if(teacher){
		res.redirect('/dashboard');
	}else{
		User.getUserByUsername(username, (err, docs) => {
			if(err) throw err;
			if(!docs){
				req.flash('Error_msg', 'Something went wrong');
				res.redirect('/login');
			}else{
				var dept = docs.dept,
					year = docs.year;
				Exam.findExamForStudent(year, dept, (err, exams) => {
					if(err) throw err;
					if(exams.length == 0){
						res.send('No exams available');
					}else{
						res.send(exams);
					}
				});
			}
		});
	}
});

router.get('/attempt/:exam_name', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		exam_name = req.params.exam_name,
		teacher = req.session.passport.user.teacher;
	console.log(teacher);
	if(teacher){
		res.redirect('/dashboard');
	}else{
		User.getUserByUsername(username, (err, user) => {
			if(err) throw err;
			console.log("user :" +user);
			Exam.findExamByExamname(exam_name, user.year, user.dept, (err, exam) => {
				if(err) throw err;
				console.log("exam :" +exam);
				Exam.isAttempted(exam.username, exam_name, username, user.year, (err, attempts) => {
					if(err) throw err;
					if(attempts){
						res.send("already attempted");
					}else{
						res.render('student_exam.html', {
							exam : exam
						});
					}
				});
			});
		});
	}
});

router.post('/answer/:exam_name', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		exam_name = req.params.exam_name,
		options = [],
		ans = [],
		score = 0;
	User.getUserByUsername(username, (err, user) => {
		if(err) throw err;
		Exam.findExamByExamname(exam_name, user.year, user.dept, (err, exam) => {
			var exam = exam;
			for(var i=0;i<exam.questions.length;i++){
				options.push(req.body["option["+i+"]"]);
			}
			for(var i=0;i<exam.questions.length;i++){
				if(exam.answers[i].correct == options[i]){
					score++;
					ans.push({ given : exam.answers[i].correct, crct : exam.answers[i].correct });
				}else{
					ans.push({ given : options[i], crct : exam.answers[i].correct });
				}
			}
			var newScore = new Score({
				exam_conducted_by : exam.username,
				username : username,
				subject : exam.subject,
				year : user.year,
				dept : user.dept,
				section : user.section,
				score : score,
				exam_name : exam_name,
				ans : ans
			});
			Exam.attempted(exam.username, exam_name, username, user.year, err => {
				if(err) throw err;
				Score.addScore(newScore, err => {
					if(err) throw err;
					res.redirect('/exam');
				});
			});
		});
	});
});

module.exports = router;