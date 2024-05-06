# Contribute to the RERUM Geolocator

# Developers

Bryan Haberberger -- bryan.j.haberberger@slu.edu
Patrick Cuba -- patrick.m.cuba@slu.edu
Research Computing Group at Saint Louis Univsersity -- research.computing@slu.edu

## ❤️ Thank You

Thank you for considering a contribution to this application! The `main` branch is protected and you cannot push it.

## Installation

You will need NodeJs and Git installed on your machine:
[NodeJS Installation Guide](https://nodejs.org/en/download)
[Git Installaition Guide](https://desktop.github.com)

Then use the following git shell for installing the app on your local machine.

```
cd /code_folder
git clone https://github.com/CenterForDigitalHumanities/geolocator.git geolocator
npm install
```
 **Note: do not run** `npm audit fix`. We will do that upstream in the `main` branch

 ## Secret Token

 If you want to contribute, it is imortant you are able to deploy the code and run tests locally.  To do so, you will need to create a `.env` file which contains secrets. Once you have the secrets, you can continue.

 Contact the developers for the required development secrets!

Create a file named `.env` in the root folder.  In the above example, the root is `/code_folder/geolocator`.  `/code_folder/geolocator/.env` looks like this:

```
ACCESS_TOKEN = OBTAINED_FROM_ADMINS
REFRESH_TOKEN = OBTAINED_FROM_ADMINS
RERUM_REGISTRATION_URL = https://devstore.rerum.io/v1/
RERUM_API_ADDR = https://devstore.rerum.io/v1/api/
RERUM_ID_PATTERN = https://devstore.rerum.io/v1/id/
RERUM_ACCESS_TOKEN_URL = https://devstore.rerum.io/v1/client/request-new-access-token
PORT = 3005
```
You obtain an `ACCESS_TOKEN` AND `REFRESH_TOKEN` by signing up with [RERUM](https://store.rerum.io/v1/).

**Note: do not commit .env file when trying to push into main branch**

## Run it

Now, you can run tests
`npm run runtest`

And start the app
`npm start`

Your geolocator will attempt to run at `http://localhost:3005`.  If port `3005` is taken, then update the .env value `PORT` to an open port and try to start it again.

To stop the service, kill or exit the process via your shell (CTRL + c or CTRL + x).

## 🎉 Ready to Start Contributing!

Excellent, way to get there.  First, make a new branch through the GitHub Interface or through your shell.  Make sure you 'checkout' that branch.

```
cd /code_folder/geolocator
git checkout my_new_branch
```

