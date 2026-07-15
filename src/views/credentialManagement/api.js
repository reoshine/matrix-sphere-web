import {sphere} from "@/axios";

export function page(data) {
  return sphere.post('/credential/v1/page', data)
}

export function getById(id) {
  return sphere.get(`/credential/v1/${id}`)
}

export function create(data) {
  return sphere.post('/credential/v1/create', data)
}

export function modify(data) {
  return sphere.post('/credential/v1/modify', data)
}

export function remove(id) {
  return sphere.post(`/credential/v1/remove/${id}`)
}
