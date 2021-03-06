# esaworld

TODO: Description of the project

## Installation

Requirements:

* Heroku Toolbet [How to install](https://toolbelt.heroku.com)
* NodeJs 5.2+ [How to install](https://nodejs.org/download/)
* Ruby 2.2.2 [How to install](https://gorails.com/setup/osx/10.10-yosemite)
* Postgresql 9.4.x [How to install](http://www.postgresql.org/download/macosx/) [Management app](http://postgresapp.com/)
* Redis 3.0.x How to install [with brew (easy way)](https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298#.qi3s17v0x) [without brew](http://redis.io/download)

Before install the global independencies:

    gem install bundler
    npm install -g bower

To install run:

    bundle install

## Usage

Use the start.sh script to set everything:

    ./start.sh

or if you prefer do it manually:

1. To run the enviroment:

    postgres -D /usr/local/var/postgres

    redis-server /usr/local/etc/redis.conf

2. To run the application:

    bundle exec rails server

    RAILS_ENV=development bundle exec resque-pool

To run testing heroku on local:

    heroku local

To run test:

    bundle exec rspec

To deploy:

    git push heroku master

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request :D

## License

The MIT License (MIT)

Copyright (c) 2015 Vizzuality

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
