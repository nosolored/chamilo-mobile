define([
    'underscore',
    'backbone',
	'models/details-ranking',
    'text!template/details-ranking.html',
    'views/alert'
], function (
    _,
    Backbone,
	DetailsRankingModel,
    DetailsRankingTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var sessionId = 0;
	var detailsRankingModel = new DetailsRankingModel();

    var loadDetailsRanking = function () {
	    console.log("funcion loadDetailsRanking");
 
		var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getRanking = $.post(url, {
            action: 'getDetailsRanking',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId,
			s_id: sessionId,
			user_id: userId
        });

        $.when(getRanking).done(function (response) {
			console.log(response);
            if (!response.status) {
                return;
            }
			
			detailsRankingModel.set({"c_id": courseId});
			detailsRankingModel.set({"s_id": sessionId});
			detailsRankingModel.set({"info": response.info});
			detailsRankingModel.cid = parseInt(""+courseId+'000'+sessionId);
			
            if (response.info.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noRanking
                    }
                });
                return;
            }
		});
		
    };
	
	var DetailsRankingView = Backbone.View.extend({
        el: 'body',
        template: _.template(DetailsRankingTemplate),
        initialize: function (options) {
			this.options = options;
			$(this.el).unbind();
			
            campusModel = this.model;
			courseId = this.options.courseId;
			sessionId = this.options.sessionId;
			userId = this.options.user_id;
			console.log("initialize")
            loadDetailsRanking();
            detailsRankingModel.on('change', this.render, this);
        },
        render: function () {
			console.log(detailsRankingModel);
            this.el.innerHTML = this.template(detailsRankingModel.toJSON());
			return this;
        }
    });
	return DetailsRankingView;
});
