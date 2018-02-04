import BaseRoute from 'base-route'

export default class extends BaseRoute {
  static get UseBaseRoute() {
    return '/:lng'
  }

  initClassMiddlewares() {
    this.app.get(`${UseBaseRoute}/home`, userRole.isLoggedIn(), (req, res) => {
      req.breadcrumbs({
        name: 'breadcrumbs.home',
        url: `/${req.params.lng}/home`
      })

      //fetch all events to set in the midburn dropdown
      Event.fetchAll()
        .then((events) => {
          res.render('pages/home', {
            user: req.user,
            events: events.toJSON(),
            isAdmin: req.user.isAdmins,
            breadcrumbs: req.breadcrumbs()
          })
        })
        .catch(() => res.status(500))
      })
  }

  initClassRoutes() {

  }

  // POST handlers
  loginPost(req, res, next) {
    const renderLoginError = (message) => res.render('pages/login', {
      errorMessage: message
    })

    if (req.body.email.length === 0 || req.body.password.length === 0) {
      return renderLoginError(i18next.t('invalid_user_password'))
    }

    this.passport.authenticate('local-login', {
      failureFlash: true
    }, (err, user, info) => {
      if (err) {
        return renderLoginError(err.message)
      }

      if (!user) {
        return renderLoginError(req.flash('error'))
      }

      return req.logIn(user, (err) => {
        if (err) {
          return renderLoginError(req.flash('error'))
        }

        res.cookie('authToken', passportLib.generateJwtToken(req.body.email), { httpOnly: true, domain: '.midburn.org' })

        if (req.body['r']) {
          return res.redirect(req.body['r'])
        }
        return res.redirect('home')
      });

      })(req, res, next)
  }
}
