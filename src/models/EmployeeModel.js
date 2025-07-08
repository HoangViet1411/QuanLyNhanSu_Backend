const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    position: { type: String, required: true },
    department: { type: String, required: true },
    salary: { type: Number, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    dateOfjoining: { type: Date, required: true },
    avatar: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {type: String, enum: ['Trưởng phòng', 'Phó phòng', 'Trưởng bộ phận', 'Tổ trưởng', 'Nhân viên'],required: true}
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
