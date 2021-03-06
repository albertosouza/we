load('application');

before(loadPost, {
    only: ['show', 'edit', 'update', 'destroy']
    });

action('new', function () {
    this.title = 'New post';
    this.post = new Post();
    render();
});

action(function create() {
    var post = new Post();

    // set vars
    if(req.body.Post){
        post.content = req.body.Post.content;
    }

    // set author if user is authenticated
    if(req)
        if(req.isAuthenticated())
            post.author = req.user._id;

    post.save(function (err, post) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: post && post.errors || err});
                } else {
                    send({code: 200, data: post.toObject()});
                }
            });
            format.html(function () {
                if (err) {
                    flash('error', 'Post can not be created');
                    render('new', {
                        post: post,
                        title: 'New post'
                    });
                } else {
                    flash('info', 'Post created');
                    redirect(path_to.posts);
                }
            });
        });
    });
});

action(function index() {
    this.title = 'Posts index';
    var user  = null;

    // for sharebox add post
    this.post = new Post();

    if(req)
        if(req.user)
            user  = req.user;

    Post
        .find()
        .limit(10)
        .sort('-createdAt')
        .populate('author','bio createdAt displayName username images')
        .exec( function (err, posts) {
            switch (params.format) {
                case "json":
                    send( posts );
                    break;
                default:
                    render({
                        user: user,
                        posts: posts
                    });
            }
        });
});

action(function show() {
    this.title = 'Post show';

    switch(params.format) {
        case "json":
            send({code: 200, data: this.post});
            break;
        default:
            render();
    }
});

action(function edit() {
    this.title = 'Post edit';
    switch(params.format) {
        case "json":
            send(this.post);
            break;
        default:
            render();
    }
});

action(function update() {
    var post = this.post;
    this.title = 'Edit post details';

    if( req.body.Post ){
        req.post.content = req.body.Post.content;
    }

    this.post.save( function (err, post) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: post && post.errors || err});
                } else {
                    send({code: 200, data: post});
                }
            });
            format.html(function () {
                if (!err) {
                    flash('info', 'Post updated');
                    redirect(path_to.post(post));
                } else {
                    flash('error', 'Post can not be updated');
                    render('edit');
                }
            });
        });
    });
});

action(function destroy() {
    this.post.remove(function (error) {
        respondTo(function (format) {
            format.json(function () {
                if (error) {
                    send({code: 500, error: error});
                } else {
                    send({code: 200});
                }
            });
            format.html(function () {
                if (error) {
                    flash('error', 'Can not destroy post');
                } else {
                    flash('info', 'Post successfully removed');
                }
                send("'" + path_to.posts + "'");
            });
        });
    });
});

function loadPost() {
    Post.findOne({ '_id': params.id }, function (err, post) {
        if (err || !post) {
            if (!err && !post && params.format === 'json') {
                return send({code: 404, error: 'Not found'});
            }
            redirect(path_to.posts);
        } else {
            this.post = post;
            next();
        }
    }.bind(this));
}
