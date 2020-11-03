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
            action: 'getInfoCourse',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id'),
            c_id: courseId,
            s_id: sessionId
        });

        $.when(getInfoCourse).done(function (response) {
            if (!response.status) {
                console.log("error");
                SpinnerPlugin.activityStop();
                return;
            }

            var course = coursesCollection.findWhere({c_id: courseId, s_id: sessionId});

            if (course == null) {
                coursesCollection.create({
                    c_id: courseId,
                    s_id: sessionId,
                    title: response.info.title,
                    visibility: response.info.section.visibility,
                    icons: response.info.section.icons,
                    name: response.info.section.name,
                    status_user: response.info.statusUser
                })
            } else {
                if (course.get("title") != response.info.title ||
                    course.get("status_user") != response.info.statusUser ||
                    course.get("visibility") != response.info.section.visibility ||
                    course.get("icons") != response.info.section.icons ||
                    course.get("name") != response.info.section.name
                ) {
                    course.set({"c_id": courseId});
                    course.set({"s_id": sessionId});
                    course.set({"title": response.info.title});
                    course.set({"visibility": response.info.section.visibility});
                    course.set({"icons": response.info.section.icons});
                    course.set({"name": response.info.section.name});
                    course.set({"status_user": response.info.statusUser});
                    coursesCollection.set(course,{remove: false});
                }
            }

            SpinnerPlugin.activityStop();

            if (response.info.length === 0) {
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
            
            var assetURL = campusModel.get('url') + 
                '/plugin/chamilo_app/tool_access.php?' +
                'tool=exercise' +
                '&username=' + campusModel.get('username') +
                '&api_key=' + campusModel.get('apiKey') +
                '&user_id=' + campusModel.get('user_id') +
                '&course_id=' + courseId +
                '&session_id=' + sessionId +
                '&isStudentView=1';

            var messageBack = window.lang.BackToApp;
            var options = "location=yes,hardwareback=no,zoom=yes,hideurlbar=yes,hidenavigationbuttons=yes,toolbarcolor=#3b6b78,closebuttoncolor=#FFFFFF,closebuttoncaption=< "+messageBack;
            var inAppBrowserRef = cordova.InAppBrowser.open(assetURL, '_blank', options);

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
        },
        surveyOnClick: function (e) {
            e.preventDefault();
            
            var options = { dimBackground: true };
            SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);
            
            var assetURL = campusModel.get('url') + 
                '/plugin/chamilo_app/tool_access.php?' +
                'tool=survey' +
                '&username=' + campusModel.get('username') +
                '&api_key=' + campusModel.get('apiKey') +
                '&user_id=' + campusModel.get('user_id') +
                '&course_id=' + courseId +
                '&session_id=' + sessionId +
                '&isStudentView=1';

            var messageBack = window.lang.BackToApp;
            var options = "location=yes,hardwareback=no,zoom=no,hideurlbar=yes,hidenavigationbuttons=yes,toolbarcolor=#3b6b78,closebuttoncolor=#FFFFFF,closebuttoncaption=< "+messageBack;
            var inAppBrowserRef = cordova.InAppBrowser.open(assetURL, '_blank', options);

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
        }
    });

    return CourseView;
});
