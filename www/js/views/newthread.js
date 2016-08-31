define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/newthread.html',
    'views/alert'
], function ($, _, Backbone, NewThreadTemplate, AlertView) {
	var campusModel = null;
    var NewThreadView = Backbone.View.extend({
		el: 'body',
        template: _.template(NewThreadTemplate),
		initialize: function (options) {
			this.options = options;
			$(this.el).unbind();
            campusModel = this.model;
			courseId = this.options.courseId;
			sessionId = this.options.sessionId;
			forumId = this.options.forum_id;
			console.log("initialize")
		},
        events: {
            'submit #frm-new-thread': 'frmNewThreadOnSubmit'
        },
        render: function () {
            this.el.innerHTML = this.template({c_id: courseId, s_id: sessionId, f_id: forumId});

            return this;
        },
        frmNewThreadOnSubmit: function (e) {
            e.preventDefault();

            var self = this;

            var title = self.$('#txt-title').val().trim(); 
            var text = self.$('#txt-text').val().trim();
            var notice = self.$('#notice-email').val().trim();
			var course_id = self.$('#course-id').val().trim();
			var session_id = self.$('#session-id').val().trim();
			var forum_id = self.$('#forum-id').val().trim();

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
			
			console.log(title +' '+ text +' '+ notice +' '+ course_id +' '+ session_id +' '+ forum_id);
			var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingForm = $.post(url, {
                action: 'formNewThread',
				username: campusModel.get('username'),
				api_key: campusModel.get('apiKey'),
				user_id: campusModel.get('user_id'),
                title: title,
                text: text,
				notice: notice,
				c_id: course_id,
				s_id: session_id,
				f_id: forum_id
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

                 window.location.href = '#thread/'+course_id+'/'+session_id+'/'+forum_id;
                
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

    return NewThreadView;
});
