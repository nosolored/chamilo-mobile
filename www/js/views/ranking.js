define([
    'underscore',
    'backbone',
	'models/ranking',
    'text!template/ranking.html',
    'views/alert'
], function (
    _,
    Backbone,
	RankingModel,
    RankingTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var sessionId = 0;
	var rankingModel = new RankingModel();

    var loadRanking = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        rankingModel.set({"ranking": []});
		var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getRanking = $.post(url, {
            action: 'getRanking',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			c_id: courseId,
			s_id: sessionId
        });

        $.when(getRanking).done(function (response) {
            if (!response.status) {
                SpinnerPlugin.activityStop();
                return;
            }

			rankingModel.set({"c_id": courseId});
			rankingModel.set({"s_id": sessionId});
			rankingModel.set({"ranking": response.ranking});
			rankingModel.cid = parseInt(""+courseId+'000'+sessionId);

			SpinnerPlugin.activityStop();

            if (response.ranking.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noRanking
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

	var initEvent = function () {
		if ($("#image-podium").width() > 565) {
			var pos = $("#image-podium").position();
			var top = pos.top;
			var left = pos.left;
			$("#pos-first").css("top",top+15);
			$("#pos-first").css("left",left+225);
			$("#pos-second").css("top",top+75);
			$("#pos-second").css("left",left+400);
			$("#pos-third").css("top",top+130);
			$("#pos-third").css("left",left+45);
		} else {
			$("#image-podium").hide();	
			$("#pos-first").hide();	
			$("#pos-second").hide();	
			$("#pos-third").hide();	
		}
	};

    var RankingView = Backbone.View.extend({
        el: 'body',
        template: _.template(RankingTemplate),
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
                loadRanking();
            }

            $(window).on('orientationchange', this.updateOrientation);
            rankingModel.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template({ model:rankingModel.toJSON(), url:campusModel.get('url'),});
			initEvent();
			return this;
        },
		events: {
			'orientationchange': 'updateOrientation',
        },
        updateOrientation: function (e) {
            e.preventDefault();
			var ruta = Backbone.history.getFragment();
			if (ruta.indexOf("ranking") != -1) {
				loadRanking();
			} else {
				$(window).off('orientationchange', this.updateOrientation);
			}
		}
    });

    return RankingView;
});
