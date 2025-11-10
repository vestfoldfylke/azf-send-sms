export const config = {
  defaultSender: process.env.DEFAULT_SENDER,
  myLink: {
    baseUrl: process.env.MYLINK_BASEURL ?? undefined,
    clientId: process.env.MYLINK_CLIENT_ID ?? undefined,
    clientSecret: process.env.MYLINK_CLIENT_SECRET ?? undefined,
    obfuscation: process.env.MYLINK_OBFUSCATION ?? "Content",
    tokenUrl: process.env.MYLINK_TOKENURL ?? undefined
  }
};
