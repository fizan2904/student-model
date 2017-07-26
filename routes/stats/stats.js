var router = require('express').Router(),
	Exam = require('../../models/exam'),
	Score = require('../../models/score');

var ensureAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect('/login');
	}
}

router.get('/:exam_name', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		teacher = req.session.passport.user.teacher,
		exam_name = req.params.exam_name,
		allScores = [],
		sum = 0;
	if(!teacher){
		Score.getScores(username, exam_name, (err, exam) => {
			if(err) throw err;
			var personalScore = exam.score;
			Score.getScoresByExamname(exam_name, (err, exams) => {
				if(err) throw err;
				Exam.findExamByExamname(exam_name, exams[0].year, exams[0].dept, (err, examDetails) => {
					for(var i=0;i<exams.length;i++){
						allScores.push({ score : exams[i].score, username : exams[i].username, ans : exams[i].ans });
						sum += exams[i].score;
					}
					console.log(allScores[0].ans);
					var avg = sum/exams.length;
					res.render('scores.html', {
						avg : avg,
						exam : exam,
						allScores : allScores,
						examDetails : examDetails,
						personalScore : personalScore
					});
				});
			});
		});
	}
});

module.exports = router;