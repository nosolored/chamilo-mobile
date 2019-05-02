define([
    'backbone'
], function (Backbone) {
    var DetailsRankingModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			info: ''
		}
    });

    return DetailsRankingModel;
});
