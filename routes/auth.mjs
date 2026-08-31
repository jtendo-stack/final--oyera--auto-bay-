import express from 'express';
const router = express.Router();

router.get('/login', (req, res) => res.render('login', { title: 'Login', pageTitle: 'Login' }));

router.post('/login', async (req, res) => {
  const { name, role, email } = req.body;
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim();
  const loginRole = String(role || '').trim().toLowerCase();

  if (loginRole === 'customer' || !['technician', 'senior'].includes(loginRole)) {
    return res.status(403).render('login', {
      title: 'Login',
      pageTitle: 'Login',
      error: 'Customers should register and continue to booking. Login is only for technicians and the senior technician.'
    });
  }

  if (loginRole === 'technician') {
    const allowedTechnicians = ['kwagala joy', 'katumba jordan'];
    if (!allowedTechnicians.includes(cleanName.toLowerCase())) {
      return res.status(403).render('login', {
        title: 'Login',
        pageTitle: 'Login',
        error: 'Only Kwagala Joy and Katumba Jordan can access the technician page.'
      });
    }
  }

  if (loginRole === 'senior') {
    if (cleanName.toLowerCase() !== 'kisakye jonathan') {
      return res.status(403).render('login', {
        title: 'Login',
        pageTitle: 'Login',
        error: 'Only Kisakye Jonathan can access the senior technician dashboard.'
      });
    }
  }

  req.session.role = loginRole;
  req.session.name = cleanName || '';
  req.session.email = cleanEmail || '';

  if (loginRole === 'senior') return res.redirect('/admin');
  if (loginRole === 'technician') return res.redirect('/dashboard');
  return res.redirect('/book');
});

router.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

export default router;
