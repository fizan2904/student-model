var router = require('express').Router(),
	User = require('../../models/user'),
	Temp = require('../../models/temp_db'),
	Exam = require('../../models/exam');

var ensureAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('Error_msg', 'Please login');
		res.redirect('/login');
	}
}

router.get('/upload', ensureAuth, (req, res) => {
	res.render('upload_exam.html');	
});

router.get('/', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		teacher = req.session.passport.user.teacher;
	if(teacher){
		Exam.findExamsByUsername(username, (err, exams) => {
			if(err) throw err;
			res.render('show_exams.html', { exams : exams, teacher : true });
		});
	}else{
		User.getUserByUsername(username, (err, users) => {
			if(err) throw err;
			turf = [];
			Exam.findExamForStudent(users.year, users.dept, (err, exams) => {
				if(err) throw err;
				for(var i=0;i<exams.length;i++){
					if(exams[i].attempted.includes(username)){
						turf.push(true)
					}else{
						turf.push(false)
					}
				}
				res.render('show_exams.html', { exams : exams, teacher : false, attempted : turf });
			});
		});
	}
});

router.get('/prep', ensureAuth, (req, res) => {
	res.render('upload_exam.html');
})

router.post('/prep', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username;
	User.getUserByUsername(username, (err, users) => {
		if(err) throw err;
		var noqs = req.body.noqs,
			exam_name = req.body.exam_name,
			subject = req.body.subject,
			dept = req.body.dept,
			year = req.body.year;

		var newTemp = new Temp({
			username : username,
			no_of_que : req.body.no_of_que, 
			exam_name : exam_name,
			subject : subject,
			year : year,
			dept : dept
		});
		console.log(newTemp);
		Temp.createTemp(newTemp, (err) => {
			if(err) throw err;
			var path = 'upload/'+exam_name+'/'+req.body.no_of_que+'/';
			res.redirect(path);
		});
	});
});

router.get('/upload/:exam_name/:noqs/', ensureAuth, (req, res) => {
	var noqs = req.params.noqs,
		username = req.session.passport.user.username,
		exam_name = req.params.exam_name;
	Temp.findTempByUsername(username, (err, temp) => {
		if(err) throw err;
		if(!temp){
			res.redirect('/exam');
		}else{
			res.render('upload_questions.html', { noqs : noqs, exam_name : exam_name });
		}
	});
});

router.post('/upload', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		questions = [],
		options = [],
		answer = [];
	console.log(req.body["question1"]);
	Temp.findTempByUsername(username, (err, temp) => {
		for(var i=1;i<=temp.no_of_que;i++){
			questions.push(req.body['question'+i]);
			options.push({
				optionA : req.body['option1'+i],
				optionB : req.body['option2'+i],
				optionC : req.body['option3'+i],
				optionD : req.body['option4'+i]
			});
			answer.push({
				correct : req.body['correct'+i],
				solution : req.body['solution'+i]
			});
		}
		console.log(options, "\n", answer, "\n", questions);

		var newExam = new Exam({
			username : username,
			exam_name : temp.exam_name,
			questions : questions,
			options : options,
			answers : answer,
			year : temp.year,
			dept : temp.dept,
			subject : temp.subject
		});

		Exam.createExam(newExam, (err) => {
			if(err) throw err;
			Temp.removeTemp(username, temp.exam_name, temp.subject, temp.year, temp.dept, (err) => {
				if(err) throw err;
				res.redirect('/exam');
			});
		});
	});
});

router.post('/testupload', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username;
	Temp.findTempByUsername(username, (err, exam) => {
		if(err) throw err;
		var dept = exam.dept,
			year = exam.year,
			exam_name = exam.exam_name,
			subject = exam.subject,
			no_of_que = exam.no_of_que,
			questions = [],
			options = [],
			answer = [];
		for(var i=0;i<no_of_que;i++){
			questions.push(req.body['questions['+i+'][question]']);
			options.push({
				optionA : req.body['questions['+i+'][option1]'],
				optionB : req.body['questions['+i+'][option2]'],
				optionC : req.body['questions['+i+'][option3]'],
				optionD : req.body['questions['+i+'][option4]']
			});
			answer.push({
				correct : req.body['questions['+i+'][correct]'],
				solution : req.body['questions['+i+'][solution]']
			});
		}
		console.log(options, "\n", answer, "\n", questions);

		var newExam = new Exam({
			username : username,
			exam_name : exam_name,
			questions : questions,
			options : options,
			answers : answer,
			year : year,
			dept : dept,
			subject : subject
		});

		Exam.createExam(newExam, (err) => {
			if(err) throw err;
			Temp.removeTemp(username, exam_name, subject, year, dept, (err) => {
				if(err) throw err;
				res.redirect('/exam');
			});
		});
	});

});

router.get('/view/:dept/:year/:exam_name', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		exam_name = req.params.exam_name;
		year = req.params.year,
		dept = req.params.dept,
		teacher = req.session.passport.user.teacher;
	User.getUserByUsername(username, (err, user) => {
		if(err) throw err;
		if(teacher){
			Exam.findExamByExamname(username , exam_name, year, dept, (err, exam) => {
				if(exam){
					res.render("teacher_exam.html", {
						exam : exam
					});
				}
			});
		}
	});
});

router.get('/delete/:exam_name/:year/:dept/:subject', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		exam_name = req.params.exam_name,
		year = req.params.year,
		dept = req.params.dept,
		subject = req.params.subject;
	Exam.findExamByExamname(username, exam_name, year, dept, subject, (err, exam) => {
		if(err) throw err;
		console.log(exam);
		Exam.removeId(exam._id, err => {
			if(err) throw err;
			res.redirect('/exam');
		});
	});
});

module.exports = router;