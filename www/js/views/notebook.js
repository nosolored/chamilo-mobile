define([
    'underscore',
    'backbone',
	'models/notebook',
    'text!template/notebook.html',
    'views/alert'
], function (
    _,
    Backbone,
	NotebookModel,
    NotebookTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var sessionId = 0;
	var notebookModel = new NotebookModel();

	var loadNotebook = function () {
	    var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getNotebook = $.post(url, {
            action: 'getNotebook',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId,
			s_id: sessionId,
			user_id: campusModel.get('user_id')
        });

        $.when(getNotebook).done(function (response) {
            if (!response.status) {
                SpinnerPlugin.activityStop();
                return;
            }

			notebookModel.cid = parseInt(""+courseId+'000'+sessionId);
			notebookModel.set({"c_id": courseId});
			notebookModel.set({"s_id": sessionId});
			notebookModel.set({"notebooks": response.notebooks});

			SpinnerPlugin.activityStop();

            if (response.notebooks.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noNotebook
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

    var NotebookView = Backbone.View.extend({
        el: 'body',
        template: _.template(NotebookTemplate),
        initialize: function (options) {
			this.options = options;
			$(this.el).unbind();

			notebookModel.unbind();

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
                loadNotebook();
            }

            notebookModel.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template(notebookModel.toJSON());
			return this;
        }
    });

    return NotebookView;
});
