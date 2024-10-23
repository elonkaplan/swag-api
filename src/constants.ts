export const constants = {
  accessTokenExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  refreshTokenExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
};
