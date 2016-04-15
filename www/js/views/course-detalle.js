define([
    'underscore',
    'backbone',
    'text!template/course-detalle.html'
], function (_, Backbone, CourseDetalleTemplate) {
    var CourseDetalleView = Backbone.View.extend({
        tagName: 'a',
        className: 'list-group-item text-center',
        template: _.template(CourseDetalleTemplate),
        render: function () {
            this.el.setAttribute('href', '#course/' + this.model.cid);
			this.el.setAttribute('id', 'item_course_' + this.model.cid);

            var template = this.template(this.model.toJSON());

            this.el.innerHTML = template;

            return this;
        }
    });

    return CourseDetalleView;
});
