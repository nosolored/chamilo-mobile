define([
    'jquery',
    'underscore',
    'backbone',
    'models/home',
    'text!template/home.html',
    'views/alert'
], function ($, _, Backbone, HomeModel, HomeTemplate, AlertView) {
    var campusModel = null;
    var homeModel = new HomeModel();
    
    var check_conditions = function () {
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getResponse = $.post(url, {
            action: 'check_conditions',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id')
        });

        $.when(getResponse).done(function (response) {
            if (!response.status) {
                console.log("no response status");
                return;
            }

            if (!response.check_condition) {
                // Redirect
                window.location.href = '#inscription';
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
    
    var loadNumMessage = function () {
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getResponse = $.post(url, {
            action: 'getNumMessages',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id')
        });

        $.when(getResponse).done(function (response) {
            if (!response.status) {
				console.log("no response status");
                return;
            }
            homeModel.cid = parseInt(1);
            homeModel.set({"num_messages": response.num_messages});
            homeModel.set({"allow_students_to_browse_courses": response.allow_students_to_browse_courses});

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

    var HomeView = Backbone.View.extend({
        el: 'body',
        template: _.template(HomeTemplate),
        initialize: function () {
            $(this.el).unbind();

            homeModel.unbind();
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

                SpinnerPlugin.activityStop();
            } else {
                check_conditions();
                loadNumMessage();
            }

            homeModel.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template(homeModel.toJSON());
            return this;
        },
        events: {
            'click #btn-back-url.no-event': 'homeBackOnClick',
            'click #link-top': 'goToLinkTop',
            'click #link-block1': 'goToLink1',
            'click #link-block2': 'goToLink2',
            'click #link-block3': 'goToLink3',
            'click #link-block4': 'goToLink4'
        },
        goToLinkTop: function (e) {
            e.preventDefault();
            var options = "location=no,hardwareback=no,zoom=no";
            var ref = window.open(encodeURI('https://chamilo.org'), '_blank', options);
        },
        goToLink1: function (e) {
            e.preventDefault();
            var options = "location=no,hardwareback=no,zoom=no";
            var ref = window.open(encodeURI('https://chamilo.org/es/ayudanos/'), '_blank', options);
        },
        goToLink2: function (e) {
            e.preventDefault();
            var options = "location=no,hardwareback=no,zoom=no";
            var ref = window.open(encodeURI('https://twitter.com/chamilonoticias?lang=es'), '_blank', options);
        },
        goToLink3: function (e) {
            e.preventDefault();
            var options = "location=no,hardwareback=no,zoom=no";
            var ref = window.open(encodeURI('https://www.facebook.com/chamilolms/'), '_blank', options);
        },
        goToLink4: function (e) {
            e.preventDefault();
            var options = "location=no,hardwareback=no,zoom=no";
            var ref = window.open(encodeURI('https://www.youtube.com/channel/UCIRUiaxXws_eEgIA4pJN62g'), '_blank', options);
        },
        homeBackOnClick: function (e) {
            e.preventDefault();
        } 
    });

    return HomeView;
});
