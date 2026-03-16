function authenticate(req) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return false;
  }
  return true;
}

module.exports = { authenticate };
