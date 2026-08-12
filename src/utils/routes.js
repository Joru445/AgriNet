export function getMessagesPath(role) {
  return role === "farmer" ? "/farmer/messages" : "/messages";
}

export function getProductPath(role) {
  return role === "farmer" ? "/farmer/product" : "/product";
}
