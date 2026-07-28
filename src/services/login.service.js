import * as authService from "./auth.service";
import * as userService from "./user.service";

export async function login(form) {
  const user = await authService.login(form.email, form.password);

  const profile = await userService.getUserProfile(user.uid);

  return {
    user,
    profile,
  };
}
