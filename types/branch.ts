export interface Branch {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  isDefault: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  googleMapsUrl: string | null;
  whatsappNumber: string | null;
  businessHours: string | null;
  mapLatitude: number | null;
  mapLongitude: number | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  phoneBranchRef: string | null;
  socialBranchRef: string | null;
  hoursBranchRef: string | null;
}

export interface UserBranch {
  id: string;
  userId: string;
  branchId: string;
  branch?: Branch;
}
