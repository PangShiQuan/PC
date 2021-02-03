import substitute from 'helper/substitute';
import request from './request';

const ADMIN_BRAND = '/api/v1/account/webapi/account/users/adminid';
const adminBrand = request(ADMIN_BRAND);

export async function withAdminId(url) {
  const {data, err} = await adminBrand;
  if (err) throw new Error(`无法获取品牌信息, ${err.message}`);
  if (data) return substitute(url, {adminId: data.adminId});
}

export async function withBrand(url) {
  const {data, err} = await adminBrand;
  if (err) throw new Error(`无法获取品牌信息, ${err.message}`);
  if (data) return substitute(url, {brand: data.brand});
}
