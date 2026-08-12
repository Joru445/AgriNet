export function getMessagesPath(role) {
  return role === "farmer" ? "/farmer/messages" : "/messages";
}

export function getProductPath(role) {
  return role === "farmer" ? "/farmer/product" : "/product";
}

export function getRoleHome(role) {
  switch (role) {
    case "admin":
      return "/admin";

    case "farmer":
      return "/farmer";

    case "consumer":
      return "/home";

    default:
      return "/login";
  }
}
