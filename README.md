# news-collector-server
News Collector server RESTful APIs using Node.js, Express, and Mongoose.

### Technology Used

* Node.js
* Express
* Mongo

### Quick Start / Project Setup

If you would still prefer to do the installation manually, follow these steps:

#1 clone the repo
- git clone git@github.com:kishan-ghetiya/news-collector-server.git
- cd news-collector-server

#2 install the dependencies
- npm install

#3 set the environment variables(copy or move env file)
- cp .env.example .env
OR
- mv .env.example .env

#4 open .env and modify the environment variables (if needed)

#5 start project
- npm start

### Table of Contents

- [Features](#features)
- [Commands](#commands)
- [Project Structure](#project-structure)


### Features

- **NoSQL database**: [MongoDB](https://www.mongodb.com) object data modeling using [Mongoose](https://mongoosejs.com)
- **Authentication and authorization**: using [passport](http://www.passportjs.org)
- **Validation**: request data validation using [Joi](https://github.com/hapijs/joi)
- **Logging**: using [winston](https://github.com/winstonjs/winston) and [morgan](https://github.com/expressjs/morgan)
- **Error handling**: centralized error handling mechanism
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)
- **Santizing**: sanitize request data against xss and query injection
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Compression**: gzip compression with [compression](https://github.com/expressjs/compression)
- **Git hooks**: with [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
- **Editor config**: consistent editor configuration using [EditorConfig](https://editorconfig.org)


### Commands

#### Running locally

```bash
npm start
```


### Linting:

#### run ESLint

```bash
npm lint
```

#### fix ESLint errors

```bash
npm lint:fix
```

#### run prettier

```bash
npm prettier
```

#### fix prettier errors

```bash
npm prettier:fix
```


### Project Structure

```
src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--lib\            # Email templates and constant values
 |--middlewares\    # Custom express middlewares
 |--models\         # Mongoose models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--index.js        # App entry point
```

### Postman Collection

<!-- https://api.postman.com/collections/14543925-a4fa37f0-730f-48d0-9e6c-0c9828ff3bb2?access_key=PMAT-01J8FAAZXC12GP0ECPT9JKKSGP -->


### License

[MIT](LICENSE) - Kishan Ghetiya (kishanp.ghetiya@gmail.com)
