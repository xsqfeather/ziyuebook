import { ServerOptions } from "@hapi/hapi";
import dotEnv from "dotenv";

const parsedConfig = dotEnv.config({
  path: `env/${process.env.NODE_ENV || "development"}.env`,
});
export const config: any = parsedConfig.parsed;

export const serverConfig: ServerOptions = {
  port: config["APP_PORT"] || 4000,
  host: "0.0.0.0",
  routes: {
    cors: true,
    files: {
      relativeTo: process.cwd() + "/public",
    },
  },
  state: {
    isSecure: false,
    isHttpOnly: false,
    encoding: "none",
    strictHeader: false,
    isSameSite: false,
  },
};

export const getDefaultRoot = () => {
  return config["ROOT_ADMIN"];
};
export const getDefaultRootPass = () => {
  return config["ROOT_PASSWORD"];
};

export const getMongoURI = () => {
  return config["MONGO_URL"];
};

export const getAgendaMongoURI = () => {
  return config["AGENDA_MONGO_URL"];
};

export const getMongoDBName = () => {
  return config["DB_NAME"];
};

export const getMongoBaseURI = () => {
  return config["MONGO_BASE_URL"];
};

export const getAgendaMongoDBName = () => {
  return config["AGENDA_DB_NAME"];
};

export const getJwtSecret = () => {
  return config["JWT_SECRET"];
};

export const getShouwangAppKey = () => {
  return config["SHOUWANG_APP_KEY"];
};

export const getShouwangAppSecret = () => {
  return config["SHOUWANG_APP_SECRET"];
};

export const getShouwangAppCode = () => {
  return config["SHOUWANG_APP_CODE"];
};

export const getAppAdmin = () => {
  return config["APP_ADMIN"];
};

export const getShouwangAppMsgSign = () => {
  return config["SHOUWANG_MSG_SIGN"];
};

export const getAvatarApiSecret = () => {
  return config["AVATAR_API_SECRET"];
};

export const getAvatarApiKey = () => {
  return config["AVATAR_API_KEY"];
};

export const getAvatarUrl = () => {
  return config["AVATAR_URL"];
};

export const getOriginUrl = () => {
  return config["ORIGIN_URL"];
};

export const getTTSecretId = () => {
  return config["TT_SECRET_ID"];
};

export const getTTSecretKey = () => {
  return config["TT_SECRET_KEY"];
};

export const getTTBucket = () => {
  return config["TT_BUCKET"];
};

export const getTTBucketRegion = () => {
  return config["TT_BUCKET_REGION"];
};

export const getAliCertifyAppKey = () => {
  return config["ALI_CERTI_APP_KEY"];
};

export const getAliCertifyAppSecret = () => {
  return config["ALI_CERTI_APP_SECRET"];
};

export const getAliCertifyAppCode = () => {
  return config["ALI_CERTI_APP_CODE"];
};

export const getAliCertifyAuthUrl = () => {
  return config["ALI_CERTI_AUTH_URL"];
};

export const getAliCertifyLimit = () => {
  return config["ALI_CERTI_LIMIT"];
};

export const getXiaomaApiKey = () => {
  return config["XIAO_MA_API_KEY"];
};

export const getNowPaymentApiKey = () => {
  return config["NOW_PAYMENT_API_KEY"];
};

export const getOpenAIApiKey = () => {
  return config["OPENAI_API_KEY"];
};

export const getOpenAIOrgId = () => {
  return config["OPENAI_ORG_ID"];
};
