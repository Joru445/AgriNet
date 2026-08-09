export function getMessagesPath(role) {
  return role === "farmer" ? "/farmer/messages" : "/messages";
}
