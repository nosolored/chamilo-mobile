define([
    'jquery',
    'underscore',
    'backbone',
    'models/work-missing',
    'text!template/work-missing.html',
    'views/alert'
], function ($, _, Backbone, WorkMissingModel, WorkMissingTemplate, AlertView) {
    var campusModel = null;
    var workId = 0;
    var courseId = 0;
    var sessionId = 0;
    var workMissingModel = new WorkMissingModel();
    var loadWorkMissing = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getWorks = $.post(url, {
            action: 'getUserWithoutPublication',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id'),
            c_id: courseId,
            s_id: sessionId,
            w_id: workId
        });

        $.when(getWorks).done(function (response) {
            if (!response.status) {
                return;
            }

            workMissingModel.set({"c_id": courseId});
            workMissingModel.set({"s_id": sessionId});
            workMissingModel.set({"w_id": workId});
            workMissingModel.set({"users_list": response.users_list});

            SpinnerPlugin.activityStop();

        }).fail(function() {
            SpinnerPlugin.activityStop();
            new AlertView({
                model: {
                    message: window.lang.noConnectionToServer
                }
            });
            return;
        });
    };
    var WorkMissingView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorkMissingTemplate),
        initialize: function (options) {
            // Initialize params
            workMissingModel.unbind();

            this.options = options;
            campusModel = this.model;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;
            workId = this.options.workId;

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
                loadWorkMissing();
                workMissingModel.on('change', this.render, this);
            }
        },
        events: {
            'click #send-mail-missing': 'sendMail'
        },
        render: function () {
            this.el.innerHTML = this.template(workMissingModel.toJSON());

            return this;
        },
        sendMail: function (e) {
            e.preventDefault();
            var self = this;

            var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingForm = $.post(url, {
                action: 'sendMailMissing',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                user_id: campusModel.get('user_id'),
                w_id: workId,
                c_id: courseId,
                s_id: sessionId,
            });

            $.when(checkingForm).done(function (response) {
                if (!response.status) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    return;
                }
                self.$("#message").html(response.content);
            });

            $.when(checkingForm).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });
            });
        }
    });

    return WorkMissingView;
});
