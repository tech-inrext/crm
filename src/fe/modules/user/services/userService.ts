import axios from "axios";
import {
  USERS_API_BASE,
  ROLES_API_BASE,
  DEPARTMENTS_API_BASE,
} from "@/fe/modules/user/constants/users";

export async function fetchUsers(params: any) {
  const resp = await axios.get(USERS_API_BASE, { params });
  return resp.data;
}

export async function fetchUserById(id: string) {
  const resp = await axios.get(`${USERS_API_BASE}/${id}`);
  return resp.data?.data || resp.data;
}

export async function createUser(payload: any) {
  const resp = await axios.post(USERS_API_BASE, payload);
  return resp.data;
}

export async function updateUserById(id: string, payload: any) {
  const resp = await axios.patch(`${USERS_API_BASE}/${id}`, payload);
  return resp.data;
}

export async function fetchRoles() {
  const resp = await axios.get(`${ROLES_API_BASE}/getAllRoleList`);
  return resp.data?.data || [];
}

export async function fetchManagers(params: any = {}) {
  const resp = await axios.get(`${USERS_API_BASE}/getAllEmployeeList`, {
    params,
  });
  return resp.data?.data || [];
}

export async function fetchDepartments() {
  const resp = await axios.get(DEPARTMENTS_API_BASE, { withCredentials: true });
  return resp.data?.data || [];
}

export async function getUploadUrl(fileName: string, fileType: string) {
  const resp = await axios.post(
    "/api/v0/s3/upload-url",
    { fileName, fileType },
    { headers: { "Content-Type": "application/json" } },
  );
  return resp.data;
}

export async function uploadFileToUrl(uploadUrl: string, file: File) {
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
}
