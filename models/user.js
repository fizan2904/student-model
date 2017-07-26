var mongoose = require('mongoose'),
	bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
	username : {
		type : String,
		required : true
	},
	reg_no : {
		type : String,
		required : true
	},
	password : {
		type : String,
		required : true
	},
	teacher : {
		type : Boolean,
		required : true
	},
	section : String,
	year : Number,
	firstname : {
		type : String,
		required : true
	},
	lastname : {
		type : String,
		required : true
	},
	dept : {
		type : String,
		required : true
	},
	email : {
		type : String,
		required : true
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = (newUser, cb) => {
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(newUser.password, salt, (err, hash) => {
			newUser.password = hash;
			newUser.save(cb);
		})
	})
}

module.exports.getUserByUsername = (username, cb) => {
	User.findOne({ username : username }, cb);
}

module.exports.comparePassword = (candPass, hash, cb) => {
	bcrypt.compare(candPass, hash, (err, isMatch) => {
		if(err) throw err;
		cb(null, isMatch);
	});
}

module.exports.getUserById = (id, cb) => {
	User.findById(id, cb);
}

module.exports.getUserByReg = (reg, cb) => {
	User.findOne({ reg_no : reg }, cb);
}

module.exports.getUserByEmail = (email, cb) => {
	User.findOne({ email : email }, cb);
}