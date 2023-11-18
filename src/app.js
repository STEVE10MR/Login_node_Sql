const express = require('express');
const { engine } = require('express-handlebars');
const loginRoutes = require('./routes/login');
const session = require('express-session');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('port', PORT);

app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
    extname: '.hbs',
}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const config = {
    user: 'steve',
    password: 'Myp@ssw0rd',
    server: 'dataepic.database.windows.net',
    database: 'DataEpic',
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

app.use((req, res, next) => {
    req.sql = sql;
    req.sql.connect(config, (err) => {
        if (err) {
            console.error('Error al conectar con SQL Server:', err);
            return next(err);
        }
        next();
    });
});

app.get('/verificar-conexion', async (req, res) => {
    try {
        const result = await req.sql.query`SELECT TOP 1 * FROM Users`;
        console.log(result);

        res.send('Consulta SELECT exitosa');
    } catch (error) {
        console.error('Error al ejecutar la consulta SELECT:', error);
        res.status(500).send('Error al ejecutar la consulta SELECT');
    }
});

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.listen(app.get('port'), () => {
    console.log('listening on port ', app.get('port'));
});

app.use('/', loginRoutes);

app.get('/', (req, res) => {
    if (req.session.loggedin && res) {
        let name = req.session.name;
        res.render('home', { name });
    } else {
        res.redirect('/login');
    }
});
