import i18next from 'i18next'
import async from 'async'
import crypto from 'crypto'
import breadcrumbs from 'express-breadcrumbs'
import config from 'config'

import constants from '../models/constants'
import { Event } from '../models/event'
import mail from '../libs/mail'
import { User } from '../models/user'
import userRole from '../libs/user_role'
import passportLib from '../libs/passport'

export default class {
  // Must be overrided
  static get UseBaseRoute() {
    return '/'
  }

  constructor(app, passport) {
    this._app = app
    this._passport = passport

    this._initBaseMiddlewares()
    this._initBreadcrumbs()
    this._initFailureHandler()

    this.initClassMiddlewares()
    this.initClassRoutes()
  }

  // protected functions

  // init class middleware, must be overrided
  initClassMiddlewares() {}

  // init class routes, must be overrided
  initClassRoutes() {}

  // private functions
  _initBaseMiddlewares() {
    // set default language
    this.app.use((req, res, next) => {
      req.params.lng = req.params.lng || constants.DEFAULT_LANGUAGE
      next()
    })

    // validate language
    this.app.use('/:lng', (req, res, next) => {
      if (this.i18nConfig.languages.includes(req.params.lng)) {
        return next()
      }
      // language not found, return 404
      res.status(404)
    })

    // redirect logged in user to home
    this.app.get('/', userRole.isLoggedIn(), (req, res) => res.redirect(`/${constants.DEFAULT_LANGUAGE}/home`))

    // redirect not logged to login
    this.app.get('/:lng/', (req, res) => res.redirect(`/${req.params.lng}/login`))
  }

  _initBreadcrumbs() {
    this.app.use(breadcrumbs.init())
  }

  _initFailureHandler() {
    userRole.failureHandler = (req, res, role) => {
      if (req.url !== '/') {
        // set 403 status for any page which failed auth except homepage
        return res.status(403)
      }
      return res.redirect(`/${req.params.lng}/login?r=${req.url}`)
    }
  }

  // getters
  get app() {
    return this._app
  }

  get passport() {
    return this._passport
  }

  get i18nConfig() {
    return config.get('i18n')
  }

  get serverConfig() {
    return config.get('server')
  }

  get mailConfig() {
    return config.get('mail')
  }

  get recaptchaConfig() {
    return config.get('recaptcha')
  }
}
