define([
    'underscore',
    'backbone',
    'models/post'
], function (_, Backbone, PostModel) {
    var PostCollection = Backbone.Collection.extend({
        model: PostModel,
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();

            var postModel = new PostModel(attributes);
				postModel.cid = parseInt("" + postModel.get("c_id") + "0" + postModel.get("forum_id") + "0" + postModel.get("thread_id") + "0" + postModel.get("post_id"));  
				self.add(postModel);
                deferred.resolve();

            return deferred.promise();
        }
    });
    return PostCollection;
});
