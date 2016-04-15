define([
    'underscore',
    'backbone',
	'models/description',
    'text!template/description.html',
    'views/alert'
], function (
    _,
    Backbone,
	DescriptionModel,
    DescriptionTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var descriptionModel = new DescriptionModel();

  var loadDescription = function () {
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getDescription = $.post(url, {
            action: 'getDescription',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId
        });

        $.when(getDescription).done(function (response) {
            if (!response.status) {
                return;
            }
			
			descriptionModel.set({"c_id": courseId});
			descriptionModel.set({"descriptions": response.descriptions});
			descriptionModel.cid = courseId;
			
            if (response.descriptions.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noDescription
                    }
                });
                return;
            }
		});
    };

    var DescriptionView = Backbone.View.extend({
        el: 'body',
        template: _.template(DescriptionTemplate),
        initialize: function () {
			$(this.el).unbind();
            campusModel = this.model;
			courseId = this.id;
		
            loadDescription();
            descriptionModel.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template(descriptionModel.toJSON());
			return this;
        }
    });

    return DescriptionView;
});
