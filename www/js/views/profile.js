define([
    'underscore',
    'backbone',
    'models/profile',
    'text!template/profile.html',
    'views/alert'
], function (
    _,
    Backbone,
    ProfileModel,
    ProfileTemplate,
    AlertView
) {
    var campusModel = null;
    var profileModel = new ProfileModel();
    

  var loadProfile = function () {
      console.log("funcion loadProfile");
        /*
        if (!window.navigator.onLine) {
            new AlertView({
                model: {
                    message: window.lang.notOnLine
                }
            });
            return;
        }
        */

        console.log(profileModel);

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getCourses = $.post(url, {
            action: 'user_profile',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id')
        });

        $.when(getCourses).done(function (response) {
            console.log(response);
            if (response.error) {
                return;
            }

            profileModel.set({"complete_name": response.data.fullName});
            profileModel.set({"username": response.data.username});
            profileModel.set({"email": response.data.email});
            profileModel.set({"official_code": response.data.officialCode});
            profileModel.set({"phone": response.data.phone});
            profileModel.set({"picture_uri": response.data.pictureUri});
            profileModel.set({"extra": response.data.extra});

            if (response.data.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noCourses
                    }
                });
                return;
            }
        });
    };

    var ProfileView = Backbone.View.extend({
        el: 'body',
        template: _.template(ProfileTemplate),
        initialize: function () {
            $(this.el).unbind();
            campusModel = this.model;
            console.log("initialize")
            loadProfile();
            profileModel.on('change', this.render, this);
        },
        render: function () {
            console.log(profileModel.toJSON);
            this.el.innerHTML = this.template(profileModel.toJSON());

            return this;
        }
    });

    return ProfileView;
});
