const express = require('express')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const app = express()
const path = require('path')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const User = require('./models/user')
var bodyParser = require('body-parser');


// Logging 
app.use(morgan('dev'))

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }))

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser())

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
  key: 'user_sid',
  secret: 'somesecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}))

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Handlebars
app.engine(
  '.hbs',
  exphbs.engine({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: __dirname + '/views/layouts'
  })
)
app.set('view engine', '.hbs')

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

const hbsContent = { email: '', loggedin: false, title: "You are not logged in today", body: "Hello World" };

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {

    res.redirect('/dashboard');
  } else {
    next();
  }
};

// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
  res.render('landing', {
    layout: 'landing'
  })
});


// route for user signup
app.route('/signup')
  .get((req, res) => {
    res.render('signup',
      {
        layout: 'loginsignup'
      })
  })
  .post((req, res) => {
    console.log(req.body)
    User.create({
      email: req.body.email,
      password: req.body.password,
      recruiter: req.body.recruiter ? true : false
    })
      .then(user => {
        req.session.user = user.dataValues;
        res.redirect('/dashboard');
      })
      .catch(error => {
        console.log(error)
        res.redirect('/signup');
      });
  });


// route for user Login
app.route('/login')
  .get(sessionChecker, (req, res) => {
    //res.sendFile(__dirname + '/public/login.html');
    res.render('login', {
      layout: 'loginsignup'
    })
  })
  .post((req, res) => {
    var email = req.body.email,
      password = req.body.password;

    User.findOne({ where: { email: email } }).then(function (user) {
      if (!user) {
        res.redirect('/login');
      } else if (!user.validPassword(password)) {
        res.redirect('/login');
      } else {
        req.session.user = user.dataValues;
        res.redirect('/dashboard');
      }
    });
  });


// route for user's dashboard
app.get('/dashboard', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    hbsContent.loggedin = true;
    hbsContent.email = req.session.user.email;
    //console.log(JSON.stringify(req.session.user)); 
    console.log(req.session.user.email);
    hbsContent.title = "You are logged in";
    //res.sendFile(__dirname + '/public/dashboard.html');
    res.render('dashboard', hbsContent);
  } else {
    res.redirect('/login');
  }
});


// route for user logout
app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    hbsContent.loggedin = false;
    hbsContent.title = "You are logged out!";
    res.clearCookie('user_sid');
    console.log(JSON.stringify(hbsContent));
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


app.listen(5000, () => console.log("Server is running on port 5000"))