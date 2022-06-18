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

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getNotebook = $.post(url, {
            action: 'course_notebooks',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            course: courseId,
            session: sessionId
        });

        $.when(getNotebook).done(function (response) {
            if (response.error) {
                SpinnerPlugin.activityStop();
                return;
            }

            notebookModel.cid = parseInt(""+courseId+'000'+sessionId);
            notebookModel.set({"c_id": courseId});
            notebookModel.set({"s_id": sessionId});
            notebookModel.set({"notebooks": response.data});

            SpinnerPlugin.activityStop();

            if (response.data.length === 0) {
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
