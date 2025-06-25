const UserRouter = require('./UserRouter');
const EmployeeRouter = require('./EmployeeRouter');

const routes = (app) => {
    app.use('/api/user', UserRouter);
    app.use('/api/employee', EmployeeRouter);
}

module.exports = routes;