import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'https://tesi-app-backend.onrender.com/api/v1' //poi rimetti http://localhost:8085/api/v1
};
