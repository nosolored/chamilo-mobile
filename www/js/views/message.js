define([
    'underscore',
    'backbone',
    'views/message-nav',
    'text!template/message.html'
], function (_, Backbone, MessageNavView, MessageTemplate) {
    
	var campusModel = null;
	var messageModel = null;
	
	var loadReadMessage = function (messageId) {
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getResponse = $.post(url, {
            action: 'setReadMessage',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            messageId: messageId
        });
        $.when(getResponse).done(function (response) {
            if (!response.status) {
                return;
            }
		});
    };
	
	var MessageView = Backbone.View.extend({
        el: 'body',
        template: _.template(MessageTemplate),
		initialize: function (options) {
			this.options = options;
			$(this.el).unbind();
			campusModel = this.options.campus;
			messageModel = this.model;
			console.log("initialize");

			if(messageModel.get("read") == "1"){
				messageModel.set({read:"0"})
				messageModel.save(this.model.toJSON());
			}
			loadReadMessage(messageModel.get("messageId"));
			
			//this.render();
        },
        render: function () {
			var messageNavView = new MessageNavView({
                model: this.model
			});
			//console.log("messageId: "+this.model.get("messageId"));
			if(this.model.get("read") == "1"){
				this.model.set({read:"0"})
				this.model.save(this.model.toJSON());
			}
            this.el.innerHTML = this.template({messageKey: this.id, title: this.model.get("title"), sender: this.model.get("sender"), sendDate: this.model.get("sendDate"), hasAttachment: this.model.get("hasAttachment"), url: this.model.get("url"), content: this.model.get("content")});
            this.el.appendChild(messageNavView.render().el);

            return this;
        }
    });

    return MessageView;
});
