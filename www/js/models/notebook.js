define([
    'backbone'
], function (Backbone) {
    var NotebookModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			notebooks: []
		}
    });

    return NotebookModel;
});
