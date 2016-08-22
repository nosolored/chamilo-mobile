define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/replymessage.html',
    'views/alert'
], function ($, _, Backbone, ReplyMessageTemplate, AlertView) {
	var campusModel = null;
	var messageModel = null;
	var messageId = 0;
    var ReplyMessageView = Backbone.View.extend({
		el: 'body',
        template: _.template(ReplyMessageTemplate),
		
		initialize: function (options) {
			this.options = options;
			$(this.el).unbind();
			campusModel = this.options.campus;
            messageId = this.id;
			messageModel = this.model;
			console.log("initialize");
			console.log(campusModel);
		},
        events: {
            'submit #frm-reply-message': 'frmReplyMessageOnSubmit'
        },
		render: function () {
            this.el.innerHTML = this.template({messageId: messageModel.get("messageId"), sender: messageModel.get("sender"), subject: 'RE: '+messageModel.get("title"), content: messageModel.get("content")});
            return this;
        },
        frmReplyMessageOnSubmit: function (e) {
            e.preventDefault();

            var self = this;

            var title = self.$('#txt-title').val().trim(); 
            var text = self.$('#txt-text').val().trim();
            var message_id = self.$('#message-id').val().trim();
			var check_quote = self.$('#check_quote').is(":checked") ? 1 : 0;

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
			
			console.log(title +' '+ text +' '+message_id);
			var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingForm = $.post(url, {
                action: 'formReplyMessage',
				username: campusModel.get('username'),
				api_key: campusModel.get('apiKey'),
				user_id: campusModel.get('user_id'),
                title: title,
                text: text,
				message_id: message_id,
				check_quote: check_quote
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

                 window.location.href = '#list-messages';
                
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

    return ReplyMessageView;
});
