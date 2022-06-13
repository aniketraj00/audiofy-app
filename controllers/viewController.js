exports.redirectIfNotLoggedIn = route => {
  return (req, res, next) => {
    if(!res.locals.user) return res.redirect(route);
    next();
  }
   
}

exports.protectAdminResource = () => {
  return (req, res, next) => {
    if(res.locals.user && res.locals.user.role === 'user') return res.redirect('/')
    next();
  }
}

exports.redirectIfLoggedIn = route => {
  return (req, res, next) => {
    if(res.locals.user) return res.redirect(route);
    next();
  }
}



exports.getLogin = (req, res, next) => { 
  res.status(200).render('loginCard', {
      title: 'Login',
  });
}

exports.getSignupVerify = (req, res, next) => {
  res.status(200).render('signupVerify', {
      title: 'Signup - Confirm Email'
  });
}

exports.getSignup = (req, res, next) => {
  res.status(200).render('signup', {
      title: 'Signup - Finish Registration',
      tempUserId: req.params.tempUserId,
      verificationToken: req.params.verificationToken
  });
}

exports.getResetPasswordVerify = (req, res, next) => {
  res.status(200).render('passResetVerify', {
      title: 'Reset Password - Send Verification Email',
        
  });
}

exports.getPasswordReset = (req, res, next) => {
  res.status(200).render('passReset', {
    title: 'Reset Password - Set Your Password',
    resetToken: req.params.resetToken
  });
}

exports.getIndex = (req, res) => {
  res.status(200).render('content', {
    title: 'Home'
  });
}





/**
 * ADMIN ROUTE HANDLERS
 * ==========================================================================
 */

exports.getAdminDashboard = (req, res) => {
  res.status(200).render('admin/dashboard', {
    title: 'Admin - Dashboard',
    activePage: {
        dashboard: true 
    }
  });
}

exports.uploadAlbum = (req, res) => {
  res.status(200).render('admin/uploadAlbum', {
    title: 'Admin - Album Upload',
    activePage: {
        albumUpload: true
    }
  });
}

exports.manageAlbum = (req, res) => {
  res.status(200).render('admin/manageAlbum', {
    title: 'Admin - Album Management',
    activePage: {
        albumManage: true
      }
  });
}

exports.manageUser = (req, res) => {
  res.status(200).render('admin/manageUser', {
    title: 'Admin - User Management',
    activePage: {
      userManage: true
    }
  });
}

