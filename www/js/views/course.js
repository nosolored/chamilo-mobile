define([
    'underscore',
    'backbone',
    'text!template/course.html',
    'views/alert'
], function (
    _,
    Backbone,
    CourseTemplate,
    AlertView
) {
    var courseModel = null;
    var CourseView = Backbone.View.extend({
        el: 'body',
        template: _.template(CourseTemplate),
        initialize: function () {
			$(this.el).unbind();
            courseModel = this.model;
        },
        render: function () {
			var template = this.template(this.model.toJSON());
			this.el.innerHTML = template;
			
            return this;
        }
    });

    return CourseView;
});
