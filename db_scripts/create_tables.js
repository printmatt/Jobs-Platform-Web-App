
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '12345',
    port: 4321,
});

client.connect();

const query = `
CREATE TABLE IF NOT EXISTS Company(
    company_ID INT PRIMARY KEY NOT NULL,
    company_name VARCHAR(25) NOT NULL,
    industry VARCHAR(25) NOT NULL
);

CREATE TABLE IF NOT EXISTS Recruiter(
    recruiter_ID INT PRIMARY KEY NOT NULL,
    recruiter_name VARCHAR(25) not NULL,
    recruiter_emailAddress VARCHAR(100) NOT NULL,
    recruiter_phoneNumber VARCHAR(100) NOT NULL
    );

CREATE TABLE IF NOT EXISTS Candidate(
    candidate_ID INT PRIMARY KEY NOT NULL,
    candidate_name VARCHAR(25) NOT NULL,
    candidate_emailAddress VARCHAR(100) NOT NULL,
    candidate_phoneNumber VARCHAR(100) NOT NULL,
    skillset VARCHAR(200) NOT NULL,
    YOE INT NOT NULL,
    current_jobTitle VARCHAR(100) NOT NULL,
    current_company VARCHAR(25) NOT NULL
);


CREATE TABLE IF NOT EXISTS JobPosting(
    job_ID INT PRIMARY KEY NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    YOE_required INT NOT NULL,
    salary VARCHAR(25) NOT NULL,
    skills_requirement VARCHAR(200) NOT NULL,
    company_ID INT NOT NULL,
    recruiter_ID INT NOT NULL,
    FOREIGN KEY (company_ID) REFERENCES Company(company_ID),
    FOREIGN KEY (recruiter_ID) REFERENCES Recruiter(recruiter_ID)
    );

CREATE TABLE IF NOT EXISTS Application(
    application_ID INT PRIMARY KEY NOT NULL,
    job_ID INT NOT NULL,
    candidate_id INT NOT NULL,
    FOREIGN KEY (job_ID) REFERENCES JobPosting(job_ID),
    FOREIGN KEY (candidate_ID) REFERENCES Candidate(candidate_ID)

);
    
`
client.query(query, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Tables are successfully created');
    client.end();
});
