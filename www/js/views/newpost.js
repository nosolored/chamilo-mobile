define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/newpost.html',
    'views/alert'
], function ($, _, Backbone, NewPostTemplate, AlertView) {
	var campusModel = null;
    var NewPostView = Backbone.View.extend({
		el: 'body',
        template: _.template(NewPostTemplate),
		initialize: function (options) {
			this.options = options;
			campusModel = this.model;
			courseId = this.id;
			forumId = this.options.forum_id;
			threadId = this.options.thread_id;
			title = this.options.title;
			text = this.options.text;
			poster = this.options.poster;
		},
        events: {
            'submit #frm-new-post': 'frmNewPostOnSubmit'
        },
        render: function () {
            this.el.innerHTML = this.template({c_id: courseId, f_id: forumId, t_id: threadId, title: title, text: text, poster: poster});

            return this;
        },
        frmNewPostOnSubmit: function (e) {
            e.preventDefault();

            var self = this;

            var title = self.$('#txt-title').val().trim(); 
            var text = self.$('#txt-text').val().trim();
            var notice = self.$('#notice-email').val().trim();
			var course_id = self.$('#course-id').val().trim();
			var forum_id = self.$('#forum-id').val().trim();
			var thread_id = self.$('#thread-id').val().trim();

            if (!title) {
                new AlertView({
                    model: {
                        message: window.lang.enterTitle
                    }
                });

                return;
            }

            if (!text) {
                new AlertView({
                    model: {
                        message: window.lang.enterText
                    }
                });

                return;
            }

            self.$('#btn-submit').prop('disabled', true);
			
			console.log(title +' '+ text +' '+ notice +' '+ course_id +' '+forum_id+' '+thread_id);
			var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingForm = $.post(url, {
                action: 'formNewPost',
				username: campusModel.get('username'),
				api_key: campusModel.get('apiKey'),
				user_id: campusModel.get('user_id'),
                title: title,
                text: text,
				notice: notice,
				c_id: course_id,
				f_id: forum_id,
				t_id: thread_id
            });

            $.when(checkingForm).done(function (response) {
                if (!response.status) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    self.$('#btn-submit').prop('disabled', false);

                    return;
                }

                 window.location.href = '#post/'+course_id+'/'+forum_id+'/'+thread_id;
                
            });

            $.when(checkingForm).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });

                self.$('#btn-submit').prop('disabled', false);
            });
        }
    });

    return NewPostView;
});
