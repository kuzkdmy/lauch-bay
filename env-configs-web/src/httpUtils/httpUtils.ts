import { ConfigType } from '../types/types';
import axios from 'axios';

export const fetchConfigs = () => ({
    [ConfigType.GLOBAL]: () => {
        return axios.get('/api/v1.0/global_config');
    },
    [ConfigType.PROJECT]: ({ id }) => {
        if (id === 'projects-id') {
            return axios.get(`/api/v1.0/project`);
        }
        return axios.get(`/api/v1.0/project/${id}`);
    },
    [ConfigType.APPLICATION]: ({ id, projectId }) => {
        console.log(id, projectId);
        if (projectId) {
            return axios.get(`/api/v1.0/application?projectId=${projectId}`);
        }
        return axios.get(`/api/v1.0/application${id ? `/${id}` : ''}`);
    },
});
