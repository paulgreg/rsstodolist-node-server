import dotenv from 'dotenv'
dotenv.config()

export const TZ = process.env.TZ ?? 'Etc/GMT0'
export const DATABASE_PORT = process.env.DATABASE_PORT ?? 5432 // ?? 3306
export const DATABASE_DIALECT = process.env.DATABASE_DIALECT ?? 'postgres' //'mariadb'
export const DATABASE_HOST = process.env.DATABASE_HOST ?? '127.0.0.1'
export const DATABASE_NAME = process.env.DATABASE_NAME ?? 'rsstodolist'
export const DATABASE_USER = process.env.DATABASE_USER
export const DATABASE_PASS = process.env.DATABASE_PASS
export const PORT = process.env.PORT ?? 6070
export const CONTAINER_EXT_PORT = process.env.CONTAINER_EXT_PORT
export const PUBLIC = process.env.PUBLIC === 'true'
export const ROOT_URL = process.env.ROOT_URL

export const DATABASE_URL =
    process.env.DATABASE_URL ??
    `${DATABASE_DIALECT}://${DATABASE_USER}:${DATABASE_PASS}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`
