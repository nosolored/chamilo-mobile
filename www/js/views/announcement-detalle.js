define([
    'underscore',
    'backbone',
    'text!template/announcement-detalle.html'
], function (_, Backbone, AnnouncementDetalleTemplate) {
    var AnnouncementDetalleView = Backbone.View.extend({
        tagName: 'a',
        className: 'list-group-item',
        template: _.template(AnnouncementDetalleTemplate),
        render: function () {
            this.el.setAttribute('href', '#announcement/' + this.model.cid);
			this.el.setAttribute('id', 'item_announcement_' + this.model.cid);

            var template = this.template(this.model.toJSON());

            this.el.innerHTML = template;

            return this;
        }
    });

    return AnnouncementDetalleView;
});
