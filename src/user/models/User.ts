export interface User {
  id: number;
  email: string;
  nickname: string;
  address: string;
  profileImage?: string;
  following?: boolean;
}

export interface UserDetails extends User {
  followerCount: number;
  followingCount: number;
  artCount: number;
  creditBalance: number;
  usdcBalance: number;
}
