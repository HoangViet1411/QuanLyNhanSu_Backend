const mongoose = require('mongoose');
const emloyeeschema = new mongoose.Schema(
    {
        _id: { type: String, required: true, unique: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        position: { type: String, required: true },
        department: { type: String, required: true },
        salary: { type: Number, required: true },
        gender: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        dateOfjoining: { type: Date, required: true },
        avatar: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const Employee = mongoose.model('Employee', useschema);
module.exports = Employee;