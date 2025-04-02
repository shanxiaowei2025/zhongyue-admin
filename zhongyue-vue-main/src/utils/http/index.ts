const apiUrl = import.meta.env.VITE_API_URL;

import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import NProgress from "../progress";
import {
  getToken,
  formatToken,
  isTokenNearExpiry,
  isTokenExpired
} from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";
import router from "@/router";

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** `token`过期后，暂存待执行的请求 */
  private static requests = [];

  /** 防止重复刷新`token` */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        NProgress.start();

        // 处理回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }

        // 白名单请求不需要token
        const whiteList = ["/login/", "/refresh-token/"];
        if (whiteList.some(url => config.url.endsWith(url))) {
          return config;
        }

        return new Promise(resolve => {
          const data = getToken();
          if (!data) {
            resolve(config);
            return;
          }

          // 处理token过期情况
          if (isTokenExpired()) {
            if (!PureHttp.isRefreshing) {
              PureHttp.isRefreshing = true;
              // token过期，尝试刷新
              useUserStoreHook()
                .handRefreshToken({ refreshToken: data.refreshToken })
                .then(res => {
                  if (res.data?.accessToken) {
                    const token = res.data.accessToken;
                    config.headers["Authorization"] = formatToken(token);
                    PureHttp.requests.forEach(cb => cb(token));
                  } else {
                    // 刷新失败，跳转登录页
                    router.push({
                      path: "/login",
                      query: { redirect: router.currentRoute.value.fullPath }
                    });
                  }
                })
                .catch(() => {
                  // 刷新失败，跳转登录页
                  router.push({
                    path: "/login",
                    query: { redirect: router.currentRoute.value.fullPath }
                  });
                })
                .finally(() => {
                  PureHttp.isRefreshing = false;
                  PureHttp.requests = [];
                });
              resolve(PureHttp.retryOriginalRequest(config));
            } else {
              // 其他请求加入队列
              resolve(PureHttp.retryOriginalRequest(config));
            }
          } else if (isTokenNearExpiry()) {
            // token即将过期，后台刷新
            if (!PureHttp.isRefreshing) {
              PureHttp.isRefreshing = true;
              useUserStoreHook()
                .handRefreshToken({ refreshToken: data.refreshToken })
                .finally(() => {
                  PureHttp.isRefreshing = false;
                });
            }
            // 继续发送请求
            config.headers["Authorization"] = formatToken(data.accessToken);
            resolve(config);
          } else {
            // token 有效
            config.headers["Authorization"] = formatToken(data.accessToken);
            resolve(config);
          }
        });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        NProgress.done();

        // 处理回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: PureHttpError) => {
        const $error = error;
        NProgress.done();

        // 处理 401 错误
        if (error.response?.status === 401) {
          const userStore = useUserStoreHook();
          userStore.logOut();
          router.push({
            path: "/login",
            query: { redirect: router.currentRoute.value.fullPath }
          });
        }

        $error.isCancelRequest = Axios.isCancel($error);
        return Promise.reject($error);
      }
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /** 单独抽离的`post`工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, params, config);
  }

  /** 单独抽离的`get`工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}

export const http = new PureHttp();
