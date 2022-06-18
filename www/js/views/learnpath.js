define([
    'underscore',
    'backbone',
    'models/learnpath',
    'text!template/learnpath.html',
    'views/alert'
], function (
    _,
    Backbone,
    LearnpathModel,
    LearnpathTemplate,
    AlertView
) {
    var campusModel = null;
    var courseId = 0;
    var sessionId = 0;
    var learnpathModel = new LearnpathModel();

    var loadLearnpath = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getLearnpath = $.post(url, {
            action: 'course_learnpaths',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            course: courseId,
            session: sessionId
        });

        $.when(getLearnpath).done(function (response) {
            if (response.error) {
                SpinnerPlugin.activityStop();
                return;
            }

            learnpathModel.set({"c_id": courseId});
            learnpathModel.set({"s_id": sessionId});
            learnpathModel.set({"learnpath": response.data});
            learnpathModel.cid = parseInt(""+courseId+'000'+sessionId);

            SpinnerPlugin.activityStop();

            if (response.data.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noLearnpath
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

    var LearnpathView = Backbone.View.extend({
        el: 'body',
        template: _.template(LearnpathTemplate),
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
            } else {
                loadLearnpath();
            }

            learnpathModel.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template(learnpathModel.toJSON());
            return this;
        },
        events: {
            'click .link-learnpath': 'learnpathOnClick'
        },
        learnpathOnClick: function (e) {
            e.preventDefault();
            var assetURL = $(e.target).prop("href");
            var messageBack = window.lang.BackToApp;
            var options = "location=yes,hardwareback=no,zoom=no,hideurlbar=yes,hidenavigationbuttons=yes,toolbarcolor=#3b6b78,closebuttoncolor=#FFFFFF,closebuttoncaption=< "+messageBack;
            var inAppBrowserRef = cordova.InAppBrowser.open(assetURL, '_blank', options);

            inAppBrowserRef.addEventListener('exit', loadStopCallBack);

            function loadStopCallBack() {
                if (inAppBrowserRef != undefined) {
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
                        loadLearnpath();
                    }
                }
            }
        }
    });

    return LearnpathView;
});
