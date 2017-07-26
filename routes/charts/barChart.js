var router =require('express').Router(),
	Exam = require('../../models/exam'),
	User = require('../../models/user'),
	Score = require('../../models/score');

var ensureAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect('/login');
	}
}

router.get('/exam/:subject', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		subject = req.params.subject,
		teacher = req.session.passport.user.teacher;
	if(!teacher){
		User.getUserByUsername(username, (err, user) => {
			if(err) throw err;
			if(user){
				SubjectScores = [];
				Score.getScoreBySubject(subject, user.year, user.dept, user.section, (err, SubjectScore) => {
					if(err) throw err;
					var labels = [];
					var allScores = [];
					var UserScore = [];
					var scoresAvg = [];
					for(var i=0;i<SubjectScore.length;i++){
						if(!labels.includes(SubjectScore[i].exam_name)){
							labels.push(SubjectScore[i].exam_name);
						}
					}
					for(var i=0;i<labels.length;i++){
						var sum = 0,
							temp = [];
						for(var j=0;j<SubjectScore.length;j++){
							if(SubjectScore[j].exam_name == labels[i]){
								temp.push(SubjectScore[j].score);
								sum += SubjectScore[j].score;
							}
							if(SubjectScore[j].username == username){
								UserScore.push(SubjectScore[j].score);
							}
						}
						var Avg = sum/temp.length;
						scoresAvg.push(Avg);
					}
					res.render('barChart.html', {
						labels : labels,
						UserScore : UserScore,
						scoresAvg : scoresAvg
					});
				});
			}
		});
	}
});

router.get('/teacher/:exam_name/:year/:dept/:subject', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		exam_name = req.params.exam_name,
		year = req.params.year,
		dept = req.params.dept,
		subject = req.params.subject;
		sectionA = [];
		sectionB = [];
	Score.teacherScores(username, year, dept, subject, (err, allScores) => {
		if(err) throw err;
		for(var i=0;i<allScores.length;i++){
			if(allScores[i].section == "A"){
				sectionA.push(allScores[i].score);
			}else{
				sectionB.push(allScores[i].score);
			}
		}
		var sum = 0;
		for(var i=0;i<sectionA.length;i++){
			sum += sectionA[i];
		}
		var avgA = sum/sectionA.length;
		sum = 0;
		for(var i=0;i<sectionB.length;i++){
			sum += sectionB[i];
		}
		var avgB = sum/sectionB.length;
		res.render('teacher_chart.html' ,{
			sectionA : avgA,
			sectionB : avgB
		});
	});
})

/*router.get('/teacher/:exam_name', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		teacher = req.session.passport.user.teacher,
		exam_name = req.params.exam_name;
	if(teacher){
		User.getUserByUsername(username, (err, user) => {
			if(err) throw err;
			if(user){
				SubjectScores = [];
				Score.getScoreBySubject(subject, user.year, user.dept, user.section, (err, SubjectScore) => {
					if(err) throw err;
					var labels = [];
					var allScores = [];
					var scoresAvg = [];
					for(var i=0;i<SubjectScore.length;i++){
						if(!labels.includes(SubjectScore[i].exam_name)){
							labels.push(SubjectScore[i].exam_name);
						}
					}
					for(var i=0;i<labels.length;i++){
						var sum = 0,
							temp = [];
						for(var j=0;j<SubjectScore.length;j++){
							if(SubjectScore[j].exam_name == labels[i]){
								temp.push(SubjectScore[j].score);
								sum += SubjectScore[j].score;
							}
							if(SubjectScore[j].username == username){
								UserScore.push(SubjectScore[j].score);
							}
						}
						var Avg = sum/temp.length;
						scoresAvg.push(Avg);
					}
					res.render('barChart.html', {
						labels : labels,
						UserScore : UserScore,
						scoresAvg : scoresAvg
					});
				});
			}
		})
	}
})*/

module.exports = router;