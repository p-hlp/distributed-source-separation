import { ManagementClient } from "auth0";
import { ENV } from "../types/";

export const managementClient = new ManagementClient({
  domain: ENV.AUTH0_DOMAIN,
  clientId: ENV.AUTH0_API_GATEWAY_CLIENT_ID,
  clientSecret: ENV.AUTH0_API_GATEWAY_CLIENT_SECRET,
});
