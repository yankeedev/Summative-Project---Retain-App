// Catch-all so /api/auth/signin, /api/expenses/:id, etc. all reach the same
// Express app without a rewrite (which would change the path the app sees).
import handler from "./index";

export default handler;
