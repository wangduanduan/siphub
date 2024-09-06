export const AppEnv = {
    DBUser: process.env.DBUser ?? 'wangduanduan',
    DBPasswd: process.env.DBPasswd,
    DBAddr: process.env.DBAddr ?? '127.0.0.1',
    DBPort: process.env.DBPort ? parseInt(process.env.DBPort) : 5432,
    DBName: process.env.DBName ?? 'postgres',
    LogLevel: process.env.LogLevel ?? 'debug',
    QueryLimit: process.env.QueryLimit ? parseInt(process.env.QueryLimit) : 10
}