# RERUM Geolocator
Thank you for you interest in the RERUM Geolocator by the Research Computing Group at Saint Louis University.  Here you can bring your own resource and generate Geolocating Web Annotations to place them on a web map.  You can also add a `navPlace` property to [IIIF Defined Types](https://iiif.io/api/presentation/3.0/#21-defined-types) and import them into [RERUM](httos://rerum.io), which will make them viewable in the [Navplace Viewer](https://map.rerum.io).

## 🌟👍 Contributors 👍🌟
To contribute (you will want to run this on localhost), read the [RERUM Geolocator Contributors Guide](CONTRIBUTING.md).  You will need to contact the site admins for the token information.  If you are looking to fork and run your own geolocator, continue reading.

## Installation
The geolocator is a NodeJS app.  It can run through a standard GitHub Pages set up for a NodeJS app.

You will need to add the following GitHub Secrets:

```
ACCESS_TOKEN =
REFRESH_TOKEN =
RERUM_REGISTRATION_URL = https://store.rerum.io/v1/
RERUM_API_ADDR = https://store.rerum.io/v1/api/
RERUM_ID_PATTERN = https://store.rerum.io/v1/id/
RERUM_ACCESS_TOKEN_URL = https://store.rerum.io/v1/client/request-new-access-token
PORT = 3005
```

You can obtain an `ACCESS_TOKEN` and a `REFRESH_TOKEN` by signing up with RERUM at https://store.rerum.io/v1/.  The access token will attribute the data your app creates to your specific version, noting the data as separate from the data created by https://geo.rerum.io.

Your geolocator will attempt to run on port `3005`.  If port `3005` is taken, then update the .env value `PORT` to an open port and try to start it again.

## License and Attribution
Primary Developers: 
Bryan Haberberger -- [https://github.com/thehabes](https://github.com/thehabes)
Patrick Cuba -- [https://github.com/cubap](https://github.com/cubap)
 
&copy; 2023 Research Computing Group at Saint Louis University

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, and/or sublicense, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The Research Computing Group at Saint Louis University shall be credited for the original source code in all software distributions and publications.

The original source code remains freely and openly available.  The repackaging and sale of the original source code is not allowed.  This source code may be a part of other larger Software that is for sale, so long as that other Software contains the required attribution mentioned above.  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
