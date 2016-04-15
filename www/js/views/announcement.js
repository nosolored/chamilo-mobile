define([
    'underscore',
    'backbone',
    'text!template/announcement.html'
], function (_, Backbone, AnnouncementTemplate) {
    var AnnouncementView = Backbone.View.extend({
        el: 'body',
        template: _.template(AnnouncementTemplate),
        render: function () {
            this.el.innerHTML = this.template(this.model.toJSON());
   	        return this;
        }
    });

    return AnnouncementView;
});
