define([
    'underscore',
    'backbone',
    'models/inscription',
    'text!template/inscription.html',
    'views/alert'
], function (
    _,
    Backbone,
    InscriptionModel,
    InscriptionTemplate,
    AlertView
) {
    var campusModel = null;
    var inscriptionModel = new InscriptionModel();

    var loadCheckCondiction = function () {
        console.log("loadCheckCondiction");
        
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);
          
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getCondictions = $.post(url, {
            action: 'getConditions',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id')
        });

        $.when(getCondictions).done(function (response) {
            console.log(response);
            if (!response.status) {
                return;
            }
            inscriptionModel.set({"language_id": response.language_id});
		    inscriptionModel.set({"date": response.date});
		    inscriptionModel.set({"content": response.content});
		    inscriptionModel.set({"type": response.type});
		    inscriptionModel.set({"changes": response.changes});
		    inscriptionModel.set({"version": response.version});
		    inscriptionModel.set({"id": response.id});
		    inscriptionModel.cid = response.user_id;

		    SpinnerPlugin.activityStop();

		}).fail(function() {
		    console.log("fail");
            SpinnerPlugin.activityStop();
            new AlertView({
                model: {
                    message: window.lang.noConnectionToServer
                }
            });
            return;
        });
    };

    var InscriptionView = Backbone.View.extend({
        el: 'body',
        template: _.template(InscriptionTemplate),
        initialize: function () {
            $(this.el).unbind();

            inscriptionModel.unbind();
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
                loadCheckCondiction();
            }

            inscriptionModel.on('change', this.render, this);
        },
        render: function () {
			this.el.innerHTML = this.template(inscriptionModel.toJSON());

			return this;
        },
        events: {
			'click #registration_submit': 'setAcceptCondiction'
        },
        setAcceptCondiction: function (e) {
		    e.preventDefault();

		    var options = { dimBackground: true };
	        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

		    var self = this;

            var legal_accept_type = self.$('#registration_legal_accept_type').val();
            var legal_info = self.$('#registration_legal_info').val();
		    
			var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
			var getResponse = $.post(url, {
				action: 'setAcceptCondition',
				username: campusModel.get('username'),
				api_key: campusModel.get('apiKey'),
				user_id: campusModel.get('user_id'),
				legal_accept_type: legal_accept_type
			});
			
			$.when(getResponse).done(function (response) {
			    SpinnerPlugin.activityStop();
				if (!response.status) {
				    return;
				}
				
				window.location.href = '#';
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

    return InscriptionView;
});
