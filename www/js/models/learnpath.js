define([
    'backbone'
], function (Backbone) {
    var LearnpathModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
            s_id: 0,
            learnpath: []
        }
    });

    return LearnpathModel;
});
