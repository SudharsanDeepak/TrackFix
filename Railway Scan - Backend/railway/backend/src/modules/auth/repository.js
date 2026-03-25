const User = require('./model');
const RefreshToken = require('./refreshToken.model');

class AuthRepository {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findUserByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findUserById(id) {
    return await User.findById(id);
  }

  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async updateLastLogin(userId, ipAddress) {
    return await User.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
      lastLoginIP: ipAddress,
    });
  }

  async createRefreshToken(tokenData) {
    return await RefreshToken.create(tokenData);
  }

  async findRefreshToken(token) {
    return await RefreshToken.findOne({ token, isRevoked: false }).populate('user');
  }

  async revokeRefreshToken(token) {
    return await RefreshToken.findOneAndUpdate({ token }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId) {
    return await RefreshToken.updateMany({ user: userId, isRevoked: false }, { isRevoked: true });
  }

  async deleteExpiredTokens() {
    return await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
  }
}

module.exports = new AuthRepository();
