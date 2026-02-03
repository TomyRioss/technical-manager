export interface DeviceBrand {
  id: string;
  name: string;
  isGlobal: boolean;
  isActive: boolean;
  storeId: string | null;
  models?: DeviceModelItem[];
}

export interface DeviceModelItem {
  id: string;
  name: string;
  isActive: boolean;
  brandId: string;
}

export interface DeviceOption {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  displayName: string;
}
