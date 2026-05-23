export const permissions = {
  user: {
    admin: ["manage"],
    client: ["readOwn", "updateOwn"],
    user: ["readOwn", "updateOwn"],
  },

  listing: {
    admin: ["manage"],
    client: ["readAny", "createOwn", "readOwn", "updateOwn", "deleteOwn"],
    user: ["readAny"],
  },

  kyc: {
    admin: ["manage"],
    client: ["createOwn", "readOwn", "updateOwn"],
    user: ["createOwn", "readOwn"],
  },

  platformFee: {
    admin: ["manage"],
    client: ["readAny"],
    user: ["readAny"],
  },

  payment: {
    admin: ["manage"],
    client: ["createOwn", "readOwn"],
    user: ["createOwn", "readOwn"],
  },

  coinTransaction: {
    admin: ["manage"],
    client: ["readOwn"],
    user: ["readOwn"],
  },

  contactAccess: {
    admin: ["manage"],
    client: ["createOwn", "readOwn"],
    user: ["createOwn", "readOwn"],
  },

  notification: {
    admin: ["manage"],
    client: ["readOwn", "updateOwn", "deleteOwn"],
    user: ["readOwn", "updateOwn", "deleteOwn"],
  },

  chatRoom: {
    admin: ["manage"],
    client: ["createOwn", "readOwn"],
    user: ["createOwn", "readOwn"],
  },

  message: {
    admin: ["manage"],
    client: ["createOwn", "readOwn"],
    user: ["createOwn", "readOwn"],
  },

  chat: {
    user: ["createOwn", "readOwn"],
    client: ["createOwn", "readOwn"],
    admin: ["manage"],
  },
};
