import {manage, sphere} from "@/axios";

export function getMenuList(data) {
    return manage.get(`/menu/getMenuList/${data}`)
}

export function getMenuById(data) {
    return manage.get(`/menu/getMenuById/${data}`)
}

export function modifyMenu(data) {
    return manage.post('/menu/modifyMenu', data)
}

export function queryProjectList(data) {
    return sphere.post('/project/queryList', data)
}
