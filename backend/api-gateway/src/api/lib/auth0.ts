import { ManagementClient } from "auth0";

export const managementClient = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN ?? "",
  clientId: process.env.AUTH0_API_GATEWAY_CLIENT_ID ?? "",
  clientSecret: process.env.AUTH0_API_GATEWAY_CLIENT_SECRET ?? "",
});
