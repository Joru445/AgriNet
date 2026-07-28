import { resetPassword } from "./auth.service";

export async function forgotPassword(email) {
  await resetPassword(email);
}
