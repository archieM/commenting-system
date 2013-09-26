(function ($, BB, _) {

	//$('#add_comment').tooltip();

	var App = Backbone.View.extend({
		el: "#comments",
		events: {
			'click #addup': 'Comment_add'
		},
		initialize: function () {
			this.input_username = $('.field input[name=author]');
			this.input_comment = $('.field textarea[name=comment]');
			this.comment_list = $('#comment_list');

			this.listenTo(this.collection, 'add', this.build);
			// Fetch contacts from server
			this.collection.fetch();
		},
		
	
		
		Comment_add: function (evt) {
			evt.preventDefault();
			var _this = this;
			var comment = new Modelcomment({
				author: this.input_username.val(),
				message: this.input_comment.val(),
				upvotes: 0
			});
			


			comment.save(null, {
				success: function (model, resp, options) {
					_this.collection.add(model);
				}
			});
			this.collection.add(comment);
			var view = new CommentView({model: comment});
			this.$comment_list.append(view.render().el);
			this.input_username.val('');
			this.input_comment.val('');
		},

		

		build: function (model) {
		
			var view = new CommentView({model: model});
			this.comment_list.append(view.render().el);
			this.input_username.val('');
			this.input_comment.val('');
		}
	});

	var Modelcomment = Backbone.Model.extend({
		defaults: {
			'author': '-',
			'message': '-',
			'upvotes': '-'
		},
		idAttribute: '_id',
		url: function () {
			var location = 'http://localhost:9090/comments';
			return this.id ? (location + '/' + this.id) : location;
		},
		initialize: function () {
			this.Keys = ['author', 'comment', 'upvotes'];
		}

	});

	var CommentCollection = Backbone.Collection.extend({
		model: Modelcomment,
		url: 'http://localhost:9090/comments',
		initialize: function () {

		}
	});

	var CommentView = Backbone.View.extend({
		tagName: 'li',
		template: $('#comment-template').html(),
		events: {
			'click .upvote' : 'upvote',
			'click .delete': 'killdb',

		},
		initialize: function() {
			// Triggers after a model is deleted in the database
			this.listenTo(this.model, 'destroy', this.removeView);
		},

		upvote: function(){
			console.log('upvote');
			this.model.save();
		},
		killdb: function () {
			this.model.destroy({
				wait: true,
				success: function (model, resp, opt) {
					console.log('success: ', model);
				},
				error: function (model, xhr, opt) {
					console.log('error: ', model);
				}
			})
		},

		removeView: function () {
			this.undelegateEvents();
			this.stopListening();
			this.remove();
		},
		render: function() {
			
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(this.model.toJSON()))
			return this;
		}
	});

	var commentsApp = new App({ collection: new CommentCollection() });


	window.app = commentsApp;
})(jQuery, Backbone, _)
