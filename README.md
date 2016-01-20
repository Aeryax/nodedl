NodeDL
===================

Hey! Downloading files from your server to your pc is boring? Try **NodeDL**, it's fast and easy to use.

----------

How-to
-------------

> **Setup:**

> npm install -g nodedl

> **Streaming file:**

> nodedl myfile.ext

Screenshot
-------------

![nodedl screen](http://puu.sh/mCQFR/2b267599e3.jpg)

Help
-------------

  Usage: `nodedl [options] <filename>`

  an easy way to stream your file from command line

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --port <port>  set port on which to listen to (defaults to 3000)
    -u, --url <url>    set url path to access file (defaults is a random string[24])
    -e, --end <end>    set end of stream: once downloaded (0) or expiration date (1) (defauts 0)
    -s, --secure       use https protocol