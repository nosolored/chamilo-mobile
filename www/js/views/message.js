define([
    'underscore',
    'backbone',
    'views/message-nav',
    'text!template/message.html'
], function (_, Backbone, MessageNavView, MessageTemplate) {
    var MessageView = Backbone.View.extend({
        el: 'body',
        template: _.template(MessageTemplate),
        render: function () {
			console.log(this);
            var messageNavView = new MessageNavView({
                model: this.model
			});
console.log("ID: "+this.id);
            this.el.innerHTML = this.template({messageKey: this.id, title: this.model.get("title"), sender: this.model.get("sender"), sendDate: this.model.get("sendDate"), hasAttachment: this.model.get("hasAttachment"), url: this.model.get("url"), content: this.model.get("content")});
            this.el.appendChild(messageNavView.render().el);

            return this;
        }
    });

    return MessageView;
});
