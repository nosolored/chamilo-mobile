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
				postModel.cid = postModel.get("iid");  
				self.add(postModel);
                deferred.resolve();

            return deferred.promise();
        }
    });
    return PostCollection;
});
