export const urls = {
  frontendUrl: "http://localhost:8000",
  backendUrl: "http://localhost:3000",
  wsUrl: "ws://localhost:3000",
};

export const routes = {
  createGroup: `${urls.backendUrl}/chat/create_group`,
  getRooms: `${urls.backendUrl}/chat/conversations`,
  addUserToRoom: `${urls.backendUrl}/chat/add_group_user`,
  roomMessages: `${urls.backendUrl}/chat/room_messages`,
  sendMessageToRoom: `${urls.backendUrl}/chat/message_to_room`,
  users: `${urls.backendUrl}/users`,
  activate2fa: `${urls.backendUrl}/settings/activate-2fa`,
  currentUser: `${urls.backendUrl}/users/me`,
  login42: `${urls.backendUrl}/login/42`,
  friends: `${urls.backendUrl}/friends`,
  sendDm: `${urls.backendUrl}/chat/dm`,
  chat: `${urls.backendUrl}/chat`,
  addUserToRoomByName: `${urls.backendUrl}/chat/add_group_user_by_name`,
};
