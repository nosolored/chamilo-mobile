define([
    'backbone'
], function (Backbone) {
    var RankingModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			ranking: []
		}
    });

    return RankingModel;
});
