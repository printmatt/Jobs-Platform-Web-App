const express = require('express')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const app = express()
const path = require('path')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const { User, JobPosting, Application } = require('./models/data_models')
var bodyParser = require('body-parser');
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '12345',
  port: 4321,
});


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
      name: req.body.name,
      recruiter: req.body.recruiter ? true : false,
      yoe: req.body.yoe,
      skillset: req.body.skillset,
      jobtitle: req.body.jobtitle
    })
      .then(user => {
        req.session.user = user.dataValues;
        if (req.session.user.recruiter) {
          res.redirect('/dashboard');
        }
        else {
          res.redirect('/candidate_dashboard');
        }
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
        if (req.session.user.recruiter) {
          res.redirect('/dashboard');
        }
        else {
          res.redirect('candidate_dashboard');
        }

      }
    });
  });

app.get('/about', (req, res) => {
  res.render('about');
})

// route for recruiter's dashboard
app.get('/dashboard', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    if (req.session.user.recruiter) {
      res.render('dashboard');
    }
    else {
      res.redirect('candidate_dashboard');
    }

  } else {
    res.redirect('/login');
  }
});


// route for candidate's dashboard
app.get('/candidate_dashboard', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render('candidate_dashboard');
  } else {
    res.redirect('/login');
  }
});

// route for user logout
app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie('user_sid');
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});


// route for create a job post
app.get('/create_job', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render('create_job', {
      layout: 'main'
    });
  } else {
    res.redirect('/login');
  }
});

app.post('/create_job', async (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    await JobPosting.create({
      job_title: req.body.job_title,
      yoe_required: req.body.yoe,
      salary: req.body.salary,
      skills_required: req.body.skills,
      company_name: req.body.company_name,
      recruiter_id: req.session.user.id
    })

    res.redirect('/recruiter_posted_jobs')
  }
  else {
    res.redirect('/login');
  }

});

app.get('/recruiter_posted_jobs', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    JobPosting.findAll({
      where: {
        recruiter_id: req.session.user.id
      }
    }).then(function (job_postings) {
      const jobs = []
      job_postings.forEach(function (posting, index) {
        jobs.push(posting.dataValues)
      })
      res.render('recruiter_posted_jobs', { jobs })
    })
  }
  else {
    res.redirect('/login');
  }

});

// route for user Login
app.route('/apply')
  .get(async (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
      const apps = await Application.findAll({
        where: {
          candidate_id: req.session.user.id
        }
      }).then((function (applications) {
        const ids = new Set()
        applications.forEach(function (app, i) {
          ids.add(app.job_id)
        })
        return ids;
      }))

      JobPosting.findAll().then((function (job_postings) {
        const jobs = []
        job_postings.forEach(function (posting, index) {
          if (!apps.has(posting.dataValues.job_id))
            jobs.push(posting.dataValues)
        })
        res.render('apply', { jobs })
      }))
    }
    else {
      res.redirect('/login');
    }
  }
  )
  .post(async (req, res) => {
    await Application.create({
      candidate_id: req.session.user.id,
      job_id: req.body.job_id,
    })
    res.redirect('/apply')
  });

app.get('/applications', async (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    const apps = await User.findAll({
      include: [
        {
          model: Application,
          required: true,
        }
      ],
      where: {
        id: req.session.user.id
      }
    })

    if(typeof apps[0] === 'undefined'){
      res.render('applications',[])
      return;
    }

    const ids = new Set()
    apps[0].applications.forEach(function (app, i) {
      ids.add(app.dataValues.job_id)
    })
  
    JobPosting.findAll().then((function (job_postings) {
      const jobs = []
      job_postings.forEach(function (posting, index) {
        if (ids.has(posting.dataValues.job_id))
          jobs.push(posting.dataValues)
      })
      res.render('applications', { jobs })
    }))
  }
  else {
    res.redirect('/login');
  }

});

// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


app.listen(5000, () => console.log("Server is running on port 5000"))