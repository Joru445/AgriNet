import * as authService from "./auth.service";
import * as userService from "./user.service";
import * as farmerService from "./farmer.service";

export async function register(form) {
  const user = await authService.register(form.email, form.password);

  await userService.createUser({
    uid: user.uid,
    fullname: form.fullname,
    fullnameLower: form.fullname.toLowerCase(),
    username: form.username.toLowerCase(),
    email: form.email,
    phone: form.contactNumber,
    role: form.role,
    location: form.location,
  });

  if (form.role === "farmer") {
    await farmerService.createFarmerProfile({
      uid: user.uid,
      fullname: form.fullname,
      fullnameLower: form.fullname.toLowerCase(),
      username: form.username.toLowerCase(),
      email: form.email,
      location: form.location,
    });
  }

  try {
    await authService.sendVerificationEmail(user);
  } catch (emailError) {
    console.warn("Verification email sending failed during registration:", emailError);
  }

  return user;
}
