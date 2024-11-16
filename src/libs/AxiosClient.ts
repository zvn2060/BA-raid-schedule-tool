import axios, { Axios, AxiosRequestConfig, CreateAxiosDefaults, isAxiosError } from "axios";
import { Jsonify, JsonValue } from "type-fest";
export class AxiosClient {
    private readonly axiosInstance: Axios;

    constructor(config: CreateAxiosDefaults) {
        this.axiosInstance = axios.create(config)
    }

    private async request<T extends JsonValue>(config: AxiosRequestConfig) {
        try {
            const response = await this.axiosInstance.request<Jsonify<T>>(config)
            return response.data
        } catch (e) {
            if (!isAxiosError(e)) throw Error(`${e}`)
            if (!e.response) throw Error(e.message)
            throw Error(e.response.data)
        }
    }

    get<T extends JsonValue>(url: string, config?: AxiosRequestConfig) {
        return this.request<T>({ method: "GET", url, ...config })
    }
}