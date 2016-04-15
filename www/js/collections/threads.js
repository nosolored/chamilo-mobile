define([
    'underscore',
    'backbone',
    'database',
    'models/thread'
], function (_, Backbone, DB, ThreadModel) {
    var ThreadCollection = Backbone.Collection.extend({
        model: ThreadModel,
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();

            var threadModel = new ThreadModel(attributes);
				threadModel.cid = parseInt("" + threadModel.get("c_id") + "00" + threadModel.get("forum_id") + "00" + threadModel.get("thread_id"));  
				self.add(threadModel);
                deferred.resolve();

            return deferred.promise();
        }
    });

    return ThreadCollection;
});
