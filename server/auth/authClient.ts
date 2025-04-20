import { createAuthClient } from "better-auth/react"
import { customSessionClient, emailOTPClient } from "better-auth/client/plugins"

import type { AuthType } from "."

const authClient = createAuthClient({
    plugins: [customSessionClient<AuthType>(), emailOTPClient()]
});

export default authClient;