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
	    console.log("funcion loadLearnpath");
	    var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getLearnpath = $.post(url, {
            action: 'getLearnpath',
            username: campusModel.get('username'),
			user_id: campusModel.get('user_id'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId,
			s_id: sessionId
        });

        $.when(getLearnpath).done(function (response) {
            if (!response.status) {
                return;
            }
			learnpathModel.set({"c_id": courseId});
			learnpathModel.set({"s_id": sessionId});
			learnpathModel.set({"base": campusModel.get('url') + 'plugin/chamilo_app/learnpath.php?username=' + campusModel.get('username') + '&api_key=' + campusModel.get('apiKey')});
			learnpathModel.set({"learnpath": response.learnpaths});
			learnpathModel.cid = parseInt(""+courseId+'000'+sessionId);
			
            if (response.learnpaths.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noLearnpath
                    }
                });
                return;
            }
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

			console.log("initialize")
		
            loadLearnpath();
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
			console.log("open link into app");
			var assetURL = $(e.target).prop("href");
			cordova.InAppBrowser.open(assetURL,'_self','location=yes,hardwareback=yes');
		}
    });

    return LearnpathView;
});
