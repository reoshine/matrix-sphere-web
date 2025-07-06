import {sphere} from "@/axios";

export function page(data) {
  return sphere.post('/credential/page', data)
}