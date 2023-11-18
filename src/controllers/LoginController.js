const sql = require('mssql');
async function index(req, res) {
  if (req.session.loggedin) {
    res.redirect('/');
  } else {
    res.render('login/index');
  }
}

function register(req, res) {
  console.log("REF")
  res.render('login/register');
}

async function authRegister(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const request = new sql.Request();
    const result = await request
      .input('username', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, password)
      .query('INSERT INTO Users (Nombre, CorreoElectronico, Contraseña) VALUES (@username, @username, @passwordHash);');

    res.render('login', { alertMessage: 'Perfecto, ahora inicia sesión.' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error.message);
    res.render('login/register', { alertMessage: 'Error al registrar el usuario.' });
  }
}

async function auth(req, res) {
  let email = req.body.email;
  let password = req.body.password;

  try {
    const request = new sql.Request();
    const result = await request
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE CorreoElectronico = @email;');

    const user = result.recordset[0];

    if (user) {
      if (password !== user.Contraseña) {
        console.log('Contraseña incorrecta.');
        res.render('login', { alertMessage: 'Contraseña incorrecta.' });
        return;
      }

      console.log(user);
      req.session.loggedin = true;
      req.session.name = user.Nombre;
      res.redirect('/');
    } else {
      console.log('Usuario no encontrado.');
      res.render('login', { alertMessage: 'Usuario no encontrado.' });
    }
  } catch (error) {
    console.error('Error al consultar en SQL Server:', error.message + " "+email+" "+ password);
    res.render('login', { alertMessage: 'Error al consultar el usuario.' });
  }
}

function logout(req, res) {
  if (req.session.loggedin) {
    req.session.destroy();
  }
  res.redirect('/');
}

module.exports = {
  index: index,
  register: register,
  auth: auth,
  logout: logout,
  authRegister: authRegister
};
