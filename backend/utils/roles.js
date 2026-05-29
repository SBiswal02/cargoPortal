const ADMIN_EMAIL_DOMAIN = "@nebula-corp.com";

function resolveRole(email) {
  return email.endsWith(ADMIN_EMAIL_DOMAIN) ? "Admin" : "Standard";
}

module.exports = { ADMIN_EMAIL_DOMAIN, resolveRole };
