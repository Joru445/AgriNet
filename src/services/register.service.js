import * as authService from "./auth.service";
import * as userService from "./user.service";
import * as farmerService from "./farmer.service";

export async function register(form) {
  const user = await authService.register(form.email, form.password);

  await userService.createUserProfile({
    uid: user.uid,
    fullname: form.fullname,
    fullnameLower: form.fullname.toLowerCase(),
    username: form.fullname.toLowerCase().slice(0, 5),
    email: form.email,
    role: form.role,
  });

  if (form.role === "farmer") {
    await farmerService.createFarmerProfile({
      uid: user.uid,
      fullname: form.fullname,
      fullnameLower: form.fullname.toLowerCase(),
      username: form.fullname.toLowerCase().slice(0, 5),
      email: form.email,
    });
  }

  return user;
}
