import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * BaseService – a thin axios wrapper every page-level service extends.
 *
 * @example
 *  class UserService extends BaseService {
 *    constructor() { super("/api/v0/employee"); }
 *    getUsers = (params?: any) => this.get("/", { params });
 *  }
 */
class BaseService {
    protected readonly api: AxiosInstance;

    constructor(baseURL: string, config: AxiosRequestConfig = {}) {
        this.api = axios.create({ baseURL, ...config });
    }

    protected async get<T = unknown>(path = "/", config?: AxiosRequestConfig): Promise<T> {
        const res = await this.api.get<T>(path, config);
        return res.data;
    }

    protected async post<T = unknown>(path: string, payload?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const res = await this.api.post<T>(path, payload, config);
        return res.data;
    }

    protected async patch<T = unknown>(path: string, payload?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const res = await this.api.patch<T>(path, payload, config);
        return res.data;
    }

    protected async delete<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
        const res = await this.api.delete<T>(path, config);
        return res.data;
    }
}

export default BaseService;
