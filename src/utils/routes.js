export function getInquiriesPath(role) {
  switch (role) {
    case "admin":
      return "/admin/inquiries";

    case "farmer":
      return "/farmer/inquiries";

    case "consumer":
      return "/inquiries";

    default:
      return "/inquiries";
  }
}

export function getMessagesPath(role) {
  switch (role) {
    case "admin":
      return "/admin/messages";

    case "farmer":
      return "/farmer/messages";

    case "consumer":
      return "/messages";

    default:
      return "/messages";
  }
}

export function getProductPath(role) {
  switch (role) {
    case "admin":
      return "/admin/products";

    case "farmer":
      return "/farmer/product";

    case "consumer":
      return "/product";

    default:
      return "/product";
  }
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
