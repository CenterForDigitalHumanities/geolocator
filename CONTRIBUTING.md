# Contribute to the RERUM Geolocator

## ❤️ Thank You
Thank you for considering a contribution to this application!  The `main` branch is protected and you cannot push to it. 

## localhost / I Need Tokens!
If you want to contribute, it is imortant you are able to deploy the code and run tests locally.  To do so, you will need to create and `.env` file which contains secrets for developers.  Once you have the secrets, you can continue.

Contact the developers for the required development secrets!

Bryan Haberberger -- bryan.j.haberberger@slu.edu  
Patrick Cuba -- patrick.m.cuba@slu.edu  
Research Computing Group at Saint Louis Univsersity -- research.computing@slu.edu  

## Ready to Install It And Run It!

You may contribute to the code directly through its repository or by making a fork in your own repository space. Please make a new branch, and when you are a finished open a pull request targeting the `main` branch.  The pull request will be reviewed.

First, make sure NodeJS is installed on your machine.  For download and installation instructions [head to the NodeJS guide][https://nodejs.org/en/download].

Also make sure Git is installed on your machine.  For download and installation instruction, [head to the Git guide](https://git-scm.com/downloads).  Note this can also be achieved by install [GitHub for Desktop](https://desktop.github.com/).  

The following is a git shell example for installing the app on your local machine.

```
cd /code_folder
git clone https://github.com/CenterForDigitalHumanities/geolocator.git geolocator
npm install
```
**Note: do not run** `npm audit fix`.  We will do that upstream in the `main` branch.

Create your a file named `.env` in the root folder.  In the above example, the root is `/code_folder/geolocator`.  `/code_folder/geolocator/.env` looks like this:

```
ACCESS_TOKEN = OBTAINED_FROM_ADMINS
REFRESH_TOKEN = OBTAINED_FROM_ADMINS
RERUM_REGISTRATION_URL = https://devstore.rerum.io/v1/
RERUM_API_ADDR = https://devstore.rerum.io/v1/api/
RERUM_ID_PATTERN = https://devstore.rerum.io/v1/id/
RERUM_ACCESS_TOKEN_URL = https://devstore.rerum.io/v1/client/request-new-access-token
PORT = 3005
```

Now, you can run tests
`npm run runtest`

And start the app
`npm start`

Your geolocator will attempt to run at `http://localhost:3005`.  If port `3005` is taken, then update the .env value `PORT` to an open port and try to start it again.

To stop the service, kill or exit the process via your shell (CTRL + c or CTRL + x).

## 🎉 Ready to code!

Excellent, way to get there.  First, make a new branch through the GitHub Interface or through your shell.  Make sure you 'checkout' that branch.

```
cd /code_folder/geolocator
git checkout my_new_branch
```

Now you can make code changes and see them in real time by using `npm start`.  When you are finished with the commits to your new branch, open a Pull Request that targets the `main` branch at [https://github.com/CenterForDigitalHumanities/geolocator/tree/main/] (https://github.com/CenterForDigitalHumanities/geolocator/tree/main/).
