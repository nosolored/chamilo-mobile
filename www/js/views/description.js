define([
    'underscore',
    'backbone',
    'collections/descriptions',
	'models/description',
    'text!template/description.html',
    'views/alert'
], function (
    _,
    Backbone,
    DescriptionsCollection,
	DescriptionModel,
    DescriptionTemplate,
    AlertView
) {
    var campusModel = null;
    var descriptionsCollection = new DescriptionsCollection();
    var descriptionModel = new DescriptionModel();
    var courseId = 0;
	var sessionId = 0;

    var loadDescription = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getDescription = $.post(url, {
            action: 'course_descriptions',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            course: courseId,
            session: sessionId
        });

        $.when(getDescription).done(function (response) {
            if (response.error) {
                return;
            }

            var description = descriptionsCollection.findWhere({c_id: courseId, s_id: sessionId});

            if (description == null) {
                descriptionsCollection.create({
                    c_id: courseId,
                    s_id: sessionId,
                    descriptions: response.data,
                })
            } else {
                if (!isEqual(description.get("descriptions"), response.data)) {
                    description.set({"descriptions": response.data});
                    descriptionsCollection.set(description,{remove: false});
                }
            }

            SpinnerPlugin.activityStop();

			if (response.data.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noDescription
                    }
                });
                return;
            }
		})
		.fail(function() {
            SpinnerPlugin.activityStop();

            new AlertView({
                model: {
                    message: window.lang.noConnectionToServer
                }
            });

            return;
        });
    };

    var DescriptionView = Backbone.View.extend({
        el: 'body',
        template: _.template(DescriptionTemplate),
        initialize: function (options) {
            // Reset event
            descriptionsCollection.unbind();

			this.options = options;
			$(this.el).unbind();
            campusModel = this.model;
			courseId = this.options.courseId;
			sessionId = this.options.sessionId;

			// Call data remote function
			var networkState = navigator.connection.type;
            if (networkState == Connection.NONE) {
                window.setTimeout(function () {
                    new AlertView({
                        model: {
                            message: window.lang.notOnLine
                        }
                    });
                }, 1000);
            } else {
                loadDescription();
            }

			descriptionsCollection.on('add', this.render, this);
			descriptionsCollection.on('change', this.render, this);
			descriptionsCollection.on('remove', this.render, this);
		},
        render: function () {
            var descriptionItem = descriptionsCollection.findWhere({c_id: courseId, s_id: sessionId});
            if (descriptionItem != null) {
                this.el.innerHTML = this.template(descriptionItem.toJSON());
            }

			return this;
        }
    });

    return DescriptionView;
});
