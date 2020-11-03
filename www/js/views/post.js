define([
    'underscore',
    'backbone',
    'collections/posts',
    'models/info_forum',
    'text!template/post.html',
    'views/alert'
], function (
    _,
    Backbone,
    PostsCollection,
    InfoModel,
    PostsTemplate,
    AlertView
) {
    var campusModel = null;
    var base = '';
    var courseId = 0;
    var postsCollection = new PostsCollection();
    var infoModel = new InfoModel();
  
    var loadPosts = function () {
        //console.log("funcion loadPosts");
       
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getPosts = $.post(url, {
            action: 'getPostsList',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id'),
            c_id: courseId,
            f_id: forumId,
            t_id: threadId
        });
        
        $.when(getPosts).done(function (response) {
            //console.log(response);
            if (!response.status) {
                return;
            }
            thread_title = response.data.thread_title;
            infoModel.set("thread_title", thread_title);        
            
            for (var i in response.data.posts) {
                var postData = response.data.posts[i];
                var cid = postData.iid;
                if (postsCollection.get(cid) == null) { 
                    postsCollection.create({
                        c_id: parseInt(postData.c_id),
                        forum_id: parseInt(postData.forum_id),
                        thread_id: parseInt(postData.thread_id),
                        post_id: parseInt(postData.post_id),
                        title: postData.post_title,
                        text: postData.post_text,                        
                        poster: postData.poster_name,
                        date: postData.date,
                        path: postData.path,
                        filename: postData.filename,
                        image: postData.image,
                        indent_cnt: postData.indent_cnt,
                        iid: postData.iid
                    });
                } else {
                    var post = postsCollection.get(cid);
                    post.set({"title": postData.post_title});
                    post.set({"text": postData.post_text});
                    post.set({"date": postData.date});
                    post.set({"poster": postData.poster_name});
                    post.set({"path": postData.path});
                    post.set({"filename": postData.filename});
                    post.set({"image": postData.image});
                    postsCollection.set(post,{remove: false});
                }
            };
            
            if (response.data.posts.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noPosts
                    }
                });
                return;
            }
        });
    };

    var PostsView = Backbone.View.extend({
        el: 'body',
        template: _.template(PostsTemplate),
        initialize: function (options) {
            this.options = options;
            $(this.el).unbind();
            
            campusModel = this.model;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;
            forumId = this.options.forum_id;
            threadId = this.options.thread_id;
            postsCollection = this.collection;
            postsCollection.unbind();
            postsCollection.reset();
            base = campusModel.get('url') + '/plugin/chamilo_app/forum-download.php?username=' + campusModel.get('username') + '&api_key=' + campusModel.get('apiKey') + '&user_id=' + campusModel.get('user_id');

            loadPosts();
            postsCollection.on('add', this.render, this);
            postsCollection.on('change', this.render, this);
            infoModel.on('change',this.render, this);
        },
        render: function () {
            thread_title = infoModel.get('thread_title');
            this.el.innerHTML = this.template({collection: postsCollection.toJSON(), c_id: courseId, s_id: sessionId, f_id: forumId, t_id: threadId, t_title: thread_title, base: base});
            return this;
        },
        events: {
            'click #post-update': 'postUpdateOnClick',
            'click .link-file-post': 'filePostOnClick'
        },
        postUpdateOnClick: function (e) {
            e.preventDefault();
            
            loadPosts();
            $(".navbar-toggle").trigger( "click" );
        },
        filePostOnClick: function (e) {
            e.preventDefault();

            var assetURL = $(e.target).prop("href");
            var fileName = $(e.target).prop("id");

			goToDownload(assetURL, fileName);
            
        }
    });
    return PostsView;
});
