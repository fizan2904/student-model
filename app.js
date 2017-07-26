var express = require('express'),
	app = express(),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	expressValidator = require('express-validator'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	flash = require('connect-flash-plus'),
	path = require('path'),
	mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1/ossm");
var db = mongoose.connection;

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('notes'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.text({ type : 'text/html' }));
app.use(cookieParser());
app.use(session({
	secret : '2746827346hjgdf762ufdvs6fuybi2eot2oh3iu',
	saveUninitialized : true,
	resave : true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator({
	errorFormatter : function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;
		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}return{
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));
app.use(flash());
app.use(function(req, res, next){
	res.locals.flash = req.flash();
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

var index = require('./routes/index');
var dash = require('./routes/dashboard/dashboard');
var register = require('./routes/userRoutes/usersRegistration');
var login = require('./routes/userRoutes/userLogin');
var notes = require('./routes/dashboard/notes');
var exam = require('./routes/examRoutes/exam');
var studExam = require('./routes/examRoutes/studentExam');
var stats = require('./routes/stats/stats');
var graphs = require('./routes/charts/barChart');
var subSel = require('./routes/charts/subSel');

app.use('/', index);
app.use('/dashboard', dash);
app.use('/register', register);
app.use('/login', login);
app.use('/notes', notes);
app.use('/exam', exam);
app.use('/exams', studExam);
app.use('/stats', stats);
app.use('/graphs', graphs);
app.use('/subSel', subSel);

app.listen(3000 || (process.env.PORT), () => {
	console.log('server started');
});