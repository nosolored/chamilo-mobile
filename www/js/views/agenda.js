define([
    'underscore',
    'backbone',
	'models/agenda',
    'text!template/agenda.html',
    'views/alert'
], function (
    _,
    Backbone,
	AgendaModel,
    AgendaTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var agendaModel = new AgendaModel();

	var loadAgenda = function () {
	    var options = { dimBackground: true };
	    SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

		var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getAgenda = $.post(url, {
            action: 'getAgenda',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId,
			s_id: sessionId,
			user_id: campusModel.get('user_id')
        });

        $.when(getAgenda).done(function (response) {
            if (!response.status) {
                SpinnerPlugin.activityStop();
                return;
            }

			agendaModel.cid = parseInt(""+courseId+'000'+sessionId);
			agendaModel.set({"c_id": courseId});
			agendaModel.set({"s_id": sessionId});
			agendaModel.set({"events": response.events});

			SpinnerPlugin.activityStop();
			
            if (response.events.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noEvents
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

    var AgendaView = Backbone.View.extend({
        el: 'body',
        template: _.template(AgendaTemplate),
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
                loadAgenda();
            }

            agendaModel.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template(agendaModel.toJSON());
			return this;
        }
    });

    return AgendaView;
});
