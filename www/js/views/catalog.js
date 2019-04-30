define([
    'underscore',
    'backbone',
    'models/catalog',
    'models/home',
    'text!template/catalog.html',
    'views/alert'
], function (
    _,
    Backbone,
    CatalogModel,
    HomeModel,
    CatalogTemplate,
    AlertView
) {
    var campusModel = null;
    var catalog = new CatalogModel();
    var homeModel = new HomeModel();
    var model = new Backbone.Model();

    var loadCatalog = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getCatalog = $.post(url, {
            action: 'getCatalog',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            code: 'ALL'
        });

        $.when(getCatalog).done(function (response) {
            if (!response.status) {
                SpinnerPlugin.activityStop();
                return;
            }

            catalog.set({"user_id": response.user_id});
            catalog.set({"list_courses": response.courses});
            catalog.set({"list_sessions": response.sessions});
            catalog.set({"user_coursecodes": response.user_coursecodes});
            catalog.set({"catalog_show_courses_sessions": response.catalog_show_courses_sessions});
            catalog.set({"categories_select": response.categories_select});
            catalog.set({"code": response.code});
            catalog.cid = response.user_id;
          
            SpinnerPlugin.activityStop();

            if (response.courses.length === 0 && response.sessions.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noCourses
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

    var goToTheCourse = function (id) {
        window.location.href = '#course/'+id+'/0';
    };

    var CatalogView = Backbone.View.extend({
        el: 'body',
        template: _.template(CatalogTemplate),
        initialize: function () {
            $(this.el).unbind();
            campusModel = this.model;

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
                loadCatalog();
            }

            catalog.on('change', this.render, this);
        },
        render: function () {
            model.set({
                num_messages: homeModel.get("num_messages"),
                list_courses: catalog.get("list_courses"),
                list_sessions: catalog.get("list_sessions"),
                user_coursecodes: catalog.get("user_coursecodes"),
                catalog_show_courses_sessions: catalog.get("catalog_show_courses_sessions"),
                categories_select: catalog.get("categories_select"),
                code: catalog.get("code"),
                user_id: catalog.get("user_id")
            });

            this.el.innerHTML = this.template(model.toJSON());
            return this;
        },
        events: {
            'click #register': 'showMessage',
            'click .subscribe_course': 'subscribeCourse',
            'change #category-catalog': 'changeCategory'
        },
        showMessage: function (e) {
            e.preventDefault();
            var message = $(e.currentTarget).prop("title");
            navigator.notification.alert(
                message,            // message
                null,               // callback
                lang.information,   // title
                'Ok'                // buttonName
            );
        },
        changeCategory: function (e) {
            e.preventDefault();

            var options = { dimBackground: true };
            SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

            var code = $(e.currentTarget).val();
            var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var getResponse = $.post(url, {
                action: 'getCatalog',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                code: code
            });

            $.when(getResponse).done(function (response) {
                if (!response.status) {
                    SpinnerPlugin.activityStop();
                    return;
                }

                catalog.set({"user_id": response.user_id});
                catalog.set({"list_courses": response.courses});
                catalog.set({"list_sessions": response.sessions});
                catalog.set({"user_coursecodes": response.user_coursecodes});
                catalog.set({"catalog_show_courses_sessions": response.catalog_show_courses_sessions});
                catalog.set({"categories_select": response.categories_select});
                catalog.set({"code": response.code});
                catalog.cid = response.user_id;

                SpinnerPlugin.activityStop();

                if (response.courses.length === 0 && response.sessions.length === 0) {
                    new AlertView({
                        model: {
                            message: window.lang.noCourses
                        }
                    });
                    return;
                }
            });
            catalog.on('change', this.render, this);
            model.on('change', this.render, this);
        },

        subscribeCourse: function (e) {
            e.preventDefault();

            var options = { dimBackground: true };
            SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

            var code = $(e.currentTarget).prop("id");
            var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var getResponse = $.post(url, {
                action: 'subscribeCourse',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                code: code
            });

            $.when(getResponse).done(function (response) {
                if (!response.status) {
                    SpinnerPlugin.activityStop();
                    return;
                }
                if (!response.id) {
                    if(!response.password){
                        navigator.notification.alert(
                            response.message,   // message
                            null,               // callback
                            lang.information,   // title
                            'Ok'                // buttonName
                        );    
                    } else {
                        function onPrompt(results, code) {
                            if(results.buttonIndex == "1"){
                                var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
                                var getResponse = $.post(url, {
                                    action: 'subscribeCoursePassword',
                                    username: campusModel.get('username'),
                                    api_key: campusModel.get('apiKey'),
                                    code: code,
                                    password: results.input1
                                });

                                $.when(getResponse).done(function (response) {
                                    if (!response.status) {
                                        return;
                                    }
                                    if (!response.id){
                                        navigator.notification.alert(
                                            response.message,   // message
                                            null,               // callback
                                            lang.information,   // title
                                            'Ok'                // buttonName
                                        );
                                    }else{
                                        navigator.notification.alert(
                                            response.message,             // message
                                            goToTheCourse(response.id),   // callback
                                            lang.information,             // title
                                            'Ok'                          // buttonName
                                        );
                                    }
                                });    
                            }
                        }

                        navigator.notification.prompt(
                            lang.passwordCourse,        // message
                            function(results){
                                onPrompt(results, code);
                            },                            // callback to invoke
                            lang.registrationCourse,    // title
                            [lang.Confirm,lang.Cancel], // buttonLabels
                            ''                             // defaultText
                        );
                    }
                } else {
                    navigator.notification.alert(
                        response.message,             // message
                        goToTheCourse(response.id),   // callback
                        lang.information,             // title
                        'Ok'                          // buttonName
                    );    
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
        }
    });

    return CatalogView;
});
