define([
    'database',
    'backbone'
], function (DB, Backbone) {
    var ForumModel = Backbone.Model.extend({
        defaults: {
            list_categories: []
        }
    });
    return ForumModel;
});
