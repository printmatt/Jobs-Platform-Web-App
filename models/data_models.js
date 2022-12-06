var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

// create a sequelize instance with our local postgres database information.
const sequelize = new Sequelize('docker', 'docker', '12345', {
    host: 'db',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});

// setup User model and its fields.
var User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    recruiter: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    yoe: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    skillset: {
        type: Sequelize.STRING,
        allowNull: false
    },
    jobtitle: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

User.beforeCreate((user, options) => {
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(user.password, salt);
});


User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

var JobPosting = sequelize.define('jobpostings', {
    job_id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    job_title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    yoe_required: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    salary: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    skills_required: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    company_name: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

var Application = sequelize.define('applications', {
    app_id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }
});

User.hasMany(JobPosting, {
    foreignKey: 'recruiter_id'
});
User.hasMany(Application, {
    foreignKey: 'candidate_id'
});
JobPosting.hasMany(Application, {
    foreignKey: 'job_id'
});




// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('All tables have been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = {User, JobPosting, Application};