export interface friendRequestDto {
  user_id: number;
}

export enum FrienshipStatus {
  pending,
  accepted,
  rejected,
}

export interface friendReqEventDto {
  event: string;
  friend_request: FriendshipRequest;
}

export interface FriendshipRequest {
  requesting_user: {
    id: number;
    display_name: string;
  };
  receiving_user: {
    id: number;
    display_name: string;
  };
  status: FrienshipStatus;
}

export interface FriendshipReqUser {
  req_user_id: number;
  status: number;
}

export interface FriendshipRecvUser {
  recv_user_id: number;
  status: number;
}
