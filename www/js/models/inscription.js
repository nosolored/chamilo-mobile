define([
    'backbone'
], function (Backbone) {
    var InscripctionModel = Backbone.Model.extend({
        defaults: {
            language_id: 0,
            date: 0,
            content: '',
            type: 0,
            changes: '',
            version: 0,
            id: 0
        }
    });

    return InscripctionModel;
});
