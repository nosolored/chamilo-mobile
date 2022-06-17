define([
    'underscore',
    'backbone',
    'collections/courses',
    'models/course',
    'text!template/course.html',
    'views/alert'
], function (
    _,
    Backbone,
    CoursesCollection,
    CourseModel,
    CourseTemplate,
    AlertView
) {
    var campusModel = null;
    var coursesCollection = new CoursesCollection();
    var course = new CourseModel();
    var courseId = 0;
    var sessionId = 0;

    var loadInfoCourse = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getInfoCourse = $.post(url, {
            action: 'course_info',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            course: courseId,
            session: sessionId
        });

        $.when(getInfoCourse).done(function (response) {
            if (response.error) {
                console.log("error");
                SpinnerPlugin.activityStop();
                return;
            }

            var course = coursesCollection.findWhere({c_id: courseId, s_id: sessionId});

            if (course == null) {
                coursesCollection.create({
                    c_id: courseId,
                    s_id: sessionId,
                    title: response.data.title,
                    visibility: response.data.section.visibility,
                    icons: response.data.section.icons,
                    name: response.data.section.name,
                    status_user: 0
                })
            } else {
                if (course.get("title") != response.data.title ||
                    course.get("status_user") != 0 ||
                    course.get("visibility") != response.data.section.visibility ||
                    course.get("icons") != response.data.section.icons ||
                    course.get("name") != response.data.section.name
                ) {
                    course.set({"c_id": courseId});
                    course.set({"s_id": sessionId});
                    course.set({"title": response.data.title});
                    course.set({"visibility": response.data.section.visibility});
                    course.set({"icons": response.data.section.icons});
                    course.set({"name": response.data.section.name});
                    course.set({"status_user": response.data.statusUser});
                    coursesCollection.set(course,{remove: false});
                }
            }

            SpinnerPlugin.activityStop();

            if (response.data.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noInfo
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

    var CourseView = Backbone.View.extend({
        el: 'body',
        template: _.template(CourseTemplate),
        initialize: function (options) {
            // Reset event
            coursesCollection.unbind();

            this.options = options;
            $(this.el).unbind();
            campusModel = this.model;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;
            coursesCollection = this.collection;

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
                loadInfoCourse();
            }
            
            screen.orientation.onchange = function(){
                if (screen.orientation.type == 'portrait-primary' || screen.orientation.type == 'portrait-secondary') {
                    var width_disp = window.screen.width;// * window.devicePixelRatio;//$(window).width();
                    $(".cut_header").css("width", parseInt(width_disp - 140)+"px");
                } else {
                    var width_disp = window.screen.width;
                    $(".cut_header").css("width", parseInt(width_disp - 140)+"px");
                }
            }
            
            coursesCollection.on('add', this.render, this);
            coursesCollection.on('change', this.render, this);
            coursesCollection.on('remove', this.render, this);
        },
        render: function () {
            var courseItem = coursesCollection.findWhere({c_id: courseId, s_id: sessionId});
            if (courseItem != null) {
                this.el.innerHTML = this.template(courseItem.toJSON());
            }

            var width_disp = $(window).width();
            this.$("#btn-back-url").css("width", parseInt(width_disp - 140)+"px");

            return this;
        },
        events: {
            'click #link-exercise': 'exerciseOnClick',
            'click #link-survey': 'surveyOnClick'
        },
        exerciseOnClick: function (e) {
            e.preventDefault();

            var options = { dimBackground: true };
            SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

            var url = campusModel.get('url') + '/main/webservices/api/v2.php';
            var getQuizTool = $.post(url, {
                action: 'view_quiz_tool',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                course: courseId,
                session: sessionId
            });

            $.when(getQuizTool).done(function (response) {
                var messageBack = window.lang.BackToApp;
                var options = "location=yes,hardwareback=no,zoom=yes,hideurlbar=yes,hidenavigationbuttons=yes,toolbarcolor=#3b6b78,closebuttoncolor=#FFFFFF,closebuttoncaption=< "+messageBack;
                var inAppBrowserRef = cordova.InAppBrowser.open(response, '_blank', options);

                inAppBrowserRef.addEventListener('loadstop', function(event) { SpinnerPlugin.activityStop(); });
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
                            loadInfoCourse();
                        }
                    }
                }
            });
        },
        surveyOnClick: function (e) {
            e.preventDefault();

            var options = { dimBackground: true };
            SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

            var url = campusModel.get('url') + '/main/webservices/api/v2.php';
            var getSurveyTool = $.post(url, {
                action: 'view_survey_tool',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                course: courseId,
                session: sessionId
            });

            $.when(getSurveyTool).done(function (response) {
                var messageBack = window.lang.BackToApp;
                var options = "location=yes,hardwareback=no,zoom=no,hideurlbar=yes,hidenavigationbuttons=yes,toolbarcolor=#3b6b78,closebuttoncolor=#FFFFFF,closebuttoncaption=< "+messageBack;
                var inAppBrowserRef = cordova.InAppBrowser.open(response, '_blank', options);

                inAppBrowserRef.addEventListener('loadstop', function(event) { SpinnerPlugin.activityStop(); });
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
                            loadInfoCourse();
                        }
                    }
                }
            });
        }
    });

    return CourseView;
});
