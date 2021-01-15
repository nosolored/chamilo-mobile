define([
    'underscore',
    'backbone',
    'models/work-main'
], function (_, Backbone, WorkMainModel) {
    var WorksMainCollection = Backbone.Collection.extend({
        model: WorkMainModel,
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();

            var workMainModel = new WorkMainModel(attributes);
            workMainModel.cid = workMainModel.get("iid");  
			self.add(workMainModel);
            deferred.resolve();

            return deferred.promise();
        }
    });

    return WorksMainCollection;
});
