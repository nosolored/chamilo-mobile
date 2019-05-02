define([
    'underscore',
    'backbone',
    'text!template/outbox-message.html'
], function (_, Backbone, OutboxMessageTemplate) {
    var OutboxMessageView = Backbone.View.extend({
        tagName: 'a',
        className: 'list-group-item',
        template: _.template(OutboxMessageTemplate),
        render: function () {
			console.log(this.model);
			console.log(this.model.toJSON());
            this.el.setAttribute('href', '#outmessage/' + this.model.cid);
			this.el.setAttribute('id', 'message' + this.model.cid);
			var template = this.template(this.model.toJSON());
			this.el.innerHTML = template;
			return this;
        }
    });

    return OutboxMessageView;
});
