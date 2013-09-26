var express = require('express'),
	app = express();

var mongoose = require('mongoose');

mongoose.connection.once('open', function () {
	console.log('MongoDB connection opened.');
});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error: '));
mongoose.connect('mongodb://localhost:27017/test');

var CommentSchema = new mongoose.Schema({
	author : String,
	comment: String,
	//date : String,
	upvotes: String
});
var Comment = mongoose.model('comments', CommentSchema);

// Setup CORS related headers
var corsSettings = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'origin, content-type, accept');
	// deal with OPTIONS method during a preflight request
	if (req.method === 'OPTIONS') {
		res.send(200);
	} else {
		next();
	}
}

app.use(express.bodyParser());
app.use(corsSettings);

function listComments(req, res) {
	var options = {};
	if (req.query.skip) {
		options.skip = req.query.skip;
	}
	if (req.query.limit) {
		options.limit = req.query.limit;
	}
	Comment.find(null, null, options, function (err, docs) {
		if (err) {
			console.log(err);
			res.send(500, err);
		} else {
			res.send(200, docs);
		}
	});
}

// Note: For security reasons, fields must be validated before saving to database in a real world scenario.
// This is only for training purposes so it's not necessary to do validation.
function createComment(req, res) {
	Comment.create(req.body, function (err, doc) {
		if (err) {
			console.log(err);
			res.send(500, err);
		} else {
			res.send(200, doc);
		}
	});
}

function deleteComment(req, res) {
	var id = req.params.id;
	Comment.findByIdAndRemove(id, function (err, doc) {
		if (err) {
			console.log(err);
			res.send(404, err);
		} else {
			res.send(200, doc);
		}
	})
}

/*function addVotes(req, res){
	var id = req.params.id;
	var vote=0;
	Comment.findOne({_id : id}, function(err, docs){
		if(err) console.log(err);
		vote=docs.upvotes;
	});
	vote=vote+1
	Comment.update({_id=id}, {upvotes: vote}, function(err){
		if(err) console.log(err);
	});
}
*/
app.get('/comments', listComments);
app.post('/comments', createComment);
app.delete('/comments/:id', deleteComment);
//app.put('/comments/:id', addVotes);

app.listen(9090);