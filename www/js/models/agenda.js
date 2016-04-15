define([
    'backbone'
], function (Backbone) {
    var AgendaModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			events: []
		}
    });

    return AgendaModel;
});
