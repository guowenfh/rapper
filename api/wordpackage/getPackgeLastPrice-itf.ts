/**
 * 本文件由 Pang 从 Rap 中自动生成，请勿修改
 * 接口名：查找词包最终价格
 * Rap: http://rap2.alibaba-inc.com/repository/editor?id=2025&itf=44983
 */
const url: string = "/wordpackage/getPackgeLastPrice.json";
const method: string = "GET";
export {url, method};

export interface Req {
  [k: string]: any;
}

export interface Res {
  data?: {
    count?: number;
    list?: {
      id?: number;
      gmtCreate?: string;
      gmtModified?: string;
      packageId?: number;
      packageName?: string;
      reservePrice?: number;
      price?: number;
      week?: number;
      [k: string]: any;
    }[];
    [k: string]: any;
  };
  info?: {
    disableTime?: boolean;
    errorCode?: null;
    lockSla?: boolean;
    message?: null;
    ok?: boolean;
    unlockUrl?: null;
    [k: string]: any;
  };
  [k: string]: any;
}
