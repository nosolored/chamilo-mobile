define([
    'underscore',
    'backbone',
    'views/message-nav',
    'text!template/outmessage.html'
], function (_, Backbone, MessageNavView, OutmessageTemplate) {
    
	var campusModel = null;
	var messageModel = null;

	
	var OutmessageView = Backbone.View.extend({
        el: 'body',
        template: _.template(OutmessageTemplate),
		initialize: function (options) {
			this.options = options;
			$(this.el).unbind();
			campusModel = this.options.campus;
			messageModel = this.model;
			console.log("initialize");
			//this.render();
        },
        render: function () {
			var messageNavView = new MessageNavView({
                model: this.model
			});
			console.log(this.model);
            this.el.innerHTML = this.template({messageKey: this.id, title: this.model.get("title"), sender: this.model.get("sender"), sendDate: this.model.get("sendDate"), hasAttachment: this.model.get("hasAttachment"), url: this.model.get("url"), content: this.model.get("content")});
            //this.el.appendChild(messageNavView.render().el);

            return this;
        }
    });

    return OutmessageView;
});
