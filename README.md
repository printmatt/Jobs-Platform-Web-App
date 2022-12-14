# Jobs-Platform-Web-App

This simple jobs platform is a full-stack **CRUD** application utilizing a few crucial web technologies. The frontend was built with **HTML, CSS, and JavaScript** combined with **Express handlebars** for a more organized layouts architecture. For the backend, we used **Node.js, Express.js, and Sequelize** to communicate with our database in **PostgreSQL**. Finally, we wrapped everything up and put them into a **Docker** image for easy deployment.

To run this application, you only need to follow these 2 steps below. Thanks to **Docker**, this will work no matter what computer or operating system you are using!! Everything is built via **Docker containers** according to the image (aka a "blueprint") that we set up.

## 1. Download and install Docker
- You can go to [this link](https://docs.docker.com/get-docker/) to download **Docker** for the computer you are using.
- After the installation is finished, turn it on according to the website's instructions.
- Open your terminal or command prompt and type `docker` to check that it's been installed. Then move on to the next step :)

## 2. Download and run our application
- Make sure you have **Docker** running in the background (you can check by typing `docker ps` in the terminal to see if it gives any error).
- Get this repository to your local computer using git or direct download.
- Open your terminal or command prompt and navigate to this repository's folder (make sure it's unzipped).
- Use this command `docker-compose --build -d` to build and run the application via **Docker containers**. This will build both the PostgreSQL database and Node.js server without needing you to install them to your computer!
- Open your web browser and go to http://localhost:5000/ to access the app. 5000 is the port that we exposed to be used for this application.
- To turn off the app, you can `stop` them via Docker to keep the data active.
- Preferably, use `docker-compose down` to shut down the app and wipe both the database and server containers.
