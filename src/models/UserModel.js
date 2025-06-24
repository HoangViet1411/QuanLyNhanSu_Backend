const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'user'] },
    employeeId: { type: String, ref: 'Employee', required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

// Middleware: Hash password trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // chỉ hash nếu password bị thay đổi

  try {
    const salt = await bcrypt.genSalt(10); // độ mạnh của salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Phương thức so sánh password khi login
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
