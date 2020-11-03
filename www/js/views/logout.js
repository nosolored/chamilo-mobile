define([
    'underscore',
    'backbone',
    'text!template/logout.html'
], function (_, Backbone, LogoutTemplate) {
    var campusModel = null;
    var courseId = 0;
    var sessionId = 0;
    var logoutPlatform = function () {
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getResponse = $.post(url, {
            action: 'logoutPlatform',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id'),
            c_id: courseId,
            s_id: sessionId
        });

        $.when(getResponse).done(function (response) {
            if (!response.status) {
                console.log("no response status");
                return;
            }

            SpinnerPlugin.activityStop();
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
    
    var success = function(status) {
        //alert('Message: ' + status);
    };
    var error = function(status) {
        //alert('Error: ' + status);
    };
    
    var LogoutView = Backbone.View.extend({
        className: 'container',
        template: _.template(LogoutTemplate),
        initialize: function (options) {
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
                window.CacheClear(success, error);

                SpinnerPlugin.activityStop();
            } else {
                logoutPlatform();
                window.CacheClear(success, error);
            }
        },
        render: function () {
            this.el.innerHTML = this.template();

            return this;
        }
    });

    return LogoutView;
});
