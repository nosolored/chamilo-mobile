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
		
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getCourses = $.post(url, {
            action: 'getProfile',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			user_id: campusModel.get('user_id')
        });

        $.when(getCourses).done(function (response) {
			console.log(response);
            if (!response.status) {
                return;
            }

            profileModel.set({"complete_name": response.profile.complete_name});
			profileModel.set({"username": response.profile.username});
			profileModel.set({"email": response.profile.email});
			profileModel.set({"official_code": response.profile.official_code});
			profileModel.set({"phone": response.profile.phone});
			profileModel.set({"picture_uri": response.profile.picture_uri});
			profileModel.set({"competences": response.profile.competences});
			profileModel.set({"diplomas": response.profile.diplomas});
			profileModel.set({"openarea": response.profile.openarea});
			profileModel.set({"teach": response.profile.teach});
			profileModel.set({"extra": response.profile.extra});
            

            if (response.profile.length === 0) {
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
