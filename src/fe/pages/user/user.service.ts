import axios from "axios";
import BaseService from "@/fe/service/BaseService";
import {
  USERS_API_BASE,
  ROLES_API_BASE,
  DEPARTMENTS_API_BASE,
} from "@/fe/pages/user/constants/users";
import type {
  Employee,
  FetchUsersParams,
  PaginatedResponse,
  UploadPresignResponse,
  UserFormData,
  RoleItem,
  ManagerItem,
  DepartmentItem,
} from "@/fe/pages/user/types";

class UserService extends BaseService {
  constructor() {
    super(USERS_API_BASE);
  }

  /** Single employee by ID */
  async getUserById(id: string): Promise<Employee> {
    const resp = await this.get<{ data?: Employee } | Employee>(`/${id}`);
    return (resp as { data?: Employee }).data ?? (resp as Employee);
  }

  /** Create a new employee */
  async createUser(
    payload: Omit<
      UserFormData,
      "aadharFile" | "panFile" | "bankProofFile" | "signatureFile" | "photoFile"
    >
  ): Promise<Employee> {
    return this.post("/", payload);
  }

  /** Update an existing employee */
  async updateUser(
    id: string,
    payload: Partial<UserFormData>
  ): Promise<Employee> {
    return this.patch(`/${id}`, payload);
  }

  /** All roles – direct axios call (different API root from employee base) */
  async getRoles(): Promise<RoleItem[]> {
    const resp = await axios.get<{ data?: RoleItem[] } | RoleItem[]>(
      `${ROLES_API_BASE}/getAllRoleList`,
      { withCredentials: true }
    );
    const payload = resp.data;
    return (payload as { data?: RoleItem[] }).data ?? (payload as RoleItem[]);
  }

  /** Employee list used as manager options */
  async getManagers(
    params: Record<string, unknown> = {}
  ): Promise<ManagerItem[]> {
    const resp = await this.get<{ data?: ManagerItem[] } | ManagerItem[]>(
      "/getAllEmployeeList",
      { params }
    );
    return (resp as { data?: ManagerItem[] }).data ?? (resp as ManagerItem[]);
  }

  /** All departments – direct axios call (different API root from employee base) */
  async getDepartments(): Promise<DepartmentItem[]> {
    const resp = await axios.get<
      { data?: DepartmentItem[] } | DepartmentItem[]
    >(DEPARTMENTS_API_BASE, { withCredentials: true });
    const payload = resp.data;
    return (
      (payload as { data?: DepartmentItem[] }).data ??
      (payload as DepartmentItem[])
    );
  }

  /** Request a pre-signed S3 upload URL – direct axios call (different API root) */
  async getUploadUrl(
    fileName: string,
    fileType: string
  ): Promise<UploadPresignResponse> {
    const resp = await axios.post<UploadPresignResponse>(
      "/api/v0/s3/upload-url",
      { fileName, fileType },
      { withCredentials: true }
    );
    return resp.data;
  }

  /** Upload a file directly to S3 using a pre-signed URL */
  async uploadFileToUrl(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
  }
}

/** Singleton – import this everywhere instead of `new UserService()` */
export const userService = new UserService();

export default userService;
