const posts = require('./posts');

exports.post = (req, res, next) => {
  posts.getPost(req.params.categoria, req.params.entrada).then((post) => {
    res.render('blog_post.html', { post: post });
  }).catch((err) => {
    if (err === '404') {
      next();
    } else {
      next(err);
    }
  });
};

exports.category = (req, res, next) => {
  posts.getPost(req.params.categoria, 'index').then((post) => {
    res.render('blog_category.html', { post: post });
  }).catch((err) => {
    if (err === '404') {
      next();
    } else {
      next(err);
    }
  });
};

exports.index = (req, res) => {
  res.render('blog.html', { post: { home: true }});
};

exports.reset = (req, res) => {
  res.json({ resets: posts.resetCache() });
}
