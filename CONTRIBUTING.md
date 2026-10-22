# Contribute to the RERUM Geolocator

## ❤️ Thank You

Thank you for considering a contribution to this application!  The `main` branch is protected and you cannot push to it. 

## localhost / I Need Tokens!

If you want to contribute, it is imortant you are able to deploy the code and run tests locally.  To do so, you will need to create a `.env` file which contains secrets for developers.  Once you have the secrets, you can continue.

Contact the developers for the required development secrets!

Bryan Haberberger -- bryan.j.haberberger@slu.edu  
Patrick Cuba -- patrick.m.cuba@slu.edu  
Research Computing Group at Saint Louis Univsersity -- research.computing@slu.edu  

## Ready to Install It And Run It!

First, make sure NodeJS is installed on your machine.  For download and installation instructions [head to the NodeJS guide](https://nodejs.org/en/download).

Also make sure Git is installed on your machine.  For download and installation instruction, [head to the Git guide](https://git-scm.com/downloads).  Note this can also be achieved by installing [GitHub for Desktop](https://desktop.github.com/).  

The following is a git shell example for installing the app on your local machine.

```
cd /code_folder
git clone https://github.com/CenterForDigitalHumanities/geolocator.git geolocator
npm install
```
**Note: do not run** `npm audit fix`.  We will do that upstream in the `main` branch.

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

Now, you can run tests
`npm test`

The test suite uses the built-in `node --test` runner and does not need real
tokens or network access.  Unit tests cover the frontend logic modules
(`public/js/`) and a supertest smoke suite covers the Express app.  Route
proxying to a live RERUM store is only exercised when you use the app itself.

And start the app
`npm start`

Your geolocator will attempt to run at `http://localhost:3005`.  If port `3005` is taken, then update the .env value `PORT` to an open port and try to start it again.

To stop the service, kill or exit the process via your shell (CTRL + c or CTRL + x).

## 🗺️ Project Structure

```
app.js               Express app: CORS allow-list, JSON-only POSTs, static
                     hosting, 301s for the retired navPlace/annotate pages
bin/geolocator.js    Process entry point (reads PORT, starts the listener)
tokens.js            Access-token expiry check + refresh (skipped when no
                     ACCESS_TOKEN is set, so tests run without secrets)
routes/              Thin proxy of /query /create /update /overwrite /delete
                     to RERUM_API_ADDR using the server ACCESS_TOKEN
public/              Static site, loaded as ES modules
  index.html         The single-page generator (both modes)
  js/iiif.js         Pure IIIF 2/3/4 detection + annotation/navPlace builders
  js/query.js        Shareable URL parameters
  js/store.js        Client for the proxy above (future TinyNode one-file swap)
  js/utils.js        HTML escaping + JSON syntax highlighting
  js/app.js          Page orchestrator (steps, mode, URL state)
  js/components/     Custom elements: geo-page, user-resource, point-picker,
                     preview-card
tests/               node:test suites (frontend logic + route smoke tests)
```

Components communicate through CustomEvents (`target-resolved`,
`target-confirmed`, `geometry-confirmed`, `resource-created`, `start-over`) —
no localStorage message bus.

## 🎉 Ready to Start Contributing!

Excellent, way to get there.  First, make a new branch through the GitHub Interface or through your shell.  Make sure you 'checkout' that branch.

```
cd /code_folder/geolocator
git checkout my_new_branch
```

Now you can make code changes and see them in real time by using `npm start`.  When you are finished with the commits to your new branch, open a Pull Request that targets the `main` branch at [https://github.com/CenterForDigitalHumanities/geolocator/tree/main/](https://github.com/CenterForDigitalHumanities/geolocator/tree/main/).
