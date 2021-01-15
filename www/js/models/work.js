define([
    'backbone'
], function (Backbone) {
    var WorkModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
            session_id: 0,
            user_id: 0,
            id: 0,
            title: '',
            description: '',
            url: '',
            sent_date: '',
            contains_file: 0,
            has_properties: 0,
            view_properties: 0,
            weight: 0,
            allow_text_assignment: 0,
            parent_id: 0,
            accepted: 0,
            qualificator_id: '',
            url_correction: '',
            title_correction: '',
            qualification_score: 0,
            fullname: '',
            title_clean: '',
            qualification_only: '',
            formatted_date: '',
            status: '',
            has_correction: '',
            feedback: '',
            feedback_clean: 0,
            comments: [],
            path: '',
        }
    });
    return WorkModel;
});
