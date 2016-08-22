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
	  console.log("funcion loadAgenda");
        /*
		if (!window.navigator.onLine) {
			console.log("aki");
            new AlertView({
                model: {
                    message: window.lang.notOnLine
                }
            });
            return;
        }
		*/

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getAgenda = $.post(url, {
            action: 'getAgenda',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId,
			user_id: campusModel.get('user_id')
        });

        $.when(getAgenda).done(function (response) {
			//console.log(response);
            if (!response.status) {
                return;
            }
			
			agendaModel.set({"c_id": courseId});
			agendaModel.set({"events": response.events});
			agendaModel.cid = courseId;
			
            if (response.events.length === 0) {
				//console.log(response.events.length);
                new AlertView({
                    model: {
                        message: window.lang.noEvents
                    }
                });
                return;
            }
		});
    };

    var AgendaView = Backbone.View.extend({
        el: 'body',
        template: _.template(AgendaTemplate),
        initialize: function () {
			$(this.el).unbind();
            campusModel = this.model;
			courseId = this.id;
			console.log("initialize")
            loadAgenda();
            agendaModel.on('change', this.render, this);
        },
        render: function () {
			//console.log(agendaModel);
            this.el.innerHTML = this.template(agendaModel.toJSON());
			return this;
        }
    });

    return AgendaView;
});
