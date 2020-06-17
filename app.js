var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var localStrategy = require("passport-local");
var flash = require("connect-flash");
var Blog = require("./models/blog");
var Comment = require("./models/comment");
var User = require("./models/user");
var session = require("express-session");
var methodOverride = require("method-override");

mongoose.connect("mongodb://localhost/blogify", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser('secret'));

// passport configuration
app.use(require("express-session")({
	secret: "dating is bs",
	resave: false,
	saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.get("/", function(req, res) {
	res.render("landing");
});

// about
app.get("/about", function(req, res) {
	res.render("about");
});

// blogs
app.get("/blogs", function(req, res) {
	Blog.find({}, function(err, allBlogs) {
		if(err) {
			console.log(err);
		} else {
			res.render("blogs/index", {blogs: allBlogs});		
		}
	});
});

app.post("/blogs", isLoggedIn, function(req, res) {
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newBlog = {name: name, image: image, description: description, author: author};
	Blog.create(newBlog, function(err, newBlog) {
		if(err) {
			console.log(err);
		} else {
			req.flash("success","Successfully created a Blog post!");
			res.redirect("/blogs");		
		}
	});
});

app.get("/blogs/new", isLoggedIn, function(req, res) {
	res.render("blogs/new");
});

app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog) {
		if(err) {
			console.log(err);
		} else {
			Blog.find({}, function(err, allBlogs) {
				if(err) {
					console.log(err);
				} else {
					res.render("blogs/show", {blog: foundBlog, blogs: allBlogs});		
				}
			});
		}
	});
});

app.get("/blogs/:id/edit", checkBlogOwnership, function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			console.log(err);
		} else {
			res.render("blogs/edit", {blog: foundBlog});
		}
	});
});

app.put("/blogs/:id", checkBlogOwnership, function(req, res) {
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, editedBlog) {
		if(err) {
			console.log(err);
		} else {
			req.flash("success","Successfully Updated!");
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

app.delete("/blogs/:id", checkBlogOwnership, function(req, res) {
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			console.log(err);
		} else {
			req.flash("error","Successfully deleted the blog post!");
			res.redirect("/blogs");
		}
	});
});

// comments
app.get("/blogs/:id/comments/new", isLoggedIn, function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {blog: foundBlog});
		}
	});
});

app.post("/blogs/:id/comments", isLoggedIn, function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			console.log(err);
			res.redirect("/blogs");
		} else {
			Comment.create(req.body.comment, function(err, newComment) {
				if(err) {
					console.log(err);
				} else {
					newComment.author.id = req.user._id;
					newComment.author.username = req.user.username;
					newComment.save();
					foundBlog.comments.push(newComment);
					foundBlog.save();
					req.flash('success', 'Created a comment!');
					res.redirect("/blogs/" + foundBlog._id);
				}
			});
		}
	});
});

app.get("/blogs/:id/comments/:commentid/edit", function(req, res) {
	Comment.findById(req.params.commentid, function(err, foundComment) {
		if(err) {
			console.log(err);
		} else {
			res.render("comments/edit", {blog_id: req.params.id, comment: foundComment});
		}
	});
});

app.put("/blogs/:id/comments/:commentid", function(req, res) {
	Comment.findByIdAndUpdate(req.params.commentid, req.body.comment, function(err, editedComment) {
		if(err) {
			console.log(err);
		} else {
            req.flash('success', 'Edited the comment successfully');
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

app.delete("/blogs/:id/comments/:commentid", function(req, res) {
	Comment.findByIdAndRemove(req.params.commentid, function(err) {
		if(err) {
			res.redirect("back");
		}
    	req.flash('error', 'Deleted the comment!');
		res.redirect("/blogs/" + req.params.id);
	});
});

// auth routes
app.get("/register", function(req, res) {
	res.render("register");
});
app.post("/register", function(req, res) {
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function() {
            req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
			res.redirect("/blogs");
		});
	});
});

app.get("/login", function(req, res) {
	res.render("login");
});
app.post("/login", passport.authenticate("local", {
	successRedirect: "/blogs",
	failureRedirect: "/login"
}), function(req, res) {});

app.get("/logout", function(req, res) {
	req.logout();
    req.flash("success", "Successfully logged you out");
	res.redirect("back");
});

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You must be signed in to do that!");
	res.redirect("/login");
}

function checkBlogOwnership(req, res, next) {
	if(req.isAuthenticated()) {
		Blog.findById(req.params.id, function(err, foundBlog) {
			if(err) {
				console.log(err);
				res.redirect("back");
			} else {
				if(foundBlog.author.id.equals(req.user._id)) {
					next();
				}
				else {
					req.flash("error", "You don't have permission to do that!");
					res.redirect("back");
				}
			}
		});
		
	} else {
		req.flash("error", "You need to be signed in to do that!");
		res.redirect("back");
	}
}

function checkCommentOwnership(req, res, next) {
	if(req.isAuthenticated()) {
		Comment.findById(req.params.commentid, function(err, foundComment) {
			if(err) {
				console.log(err);
				res.redirect("back");
			} else {
				if(foundComment.author.id.equals(req.user._id)) {
					next();
				}
				else {
					req.flash("error", "You don't have permission to do that!");
					res.redirect("back");
				}
			}
		});
		
	} else {
		req.flash("error", "You need to be signed in to do that!");
		res.redirect("back");
	}
}

app.listen(3000, function() {
	console.log("Blogify server started!");
});