import request from '@/config/axios'

export interface RegVO {
  id: number
  pid: number
  title: string
  startRecur: Date
  endRecur: Date
  cardTypes: string
  color: string
  textColor: string
  borderColor: string
  backgroundColor: string
  url: string
  remark: string
  sort: number
  status: boolean
}

// 查询课程安排列表
export const getRegList = async (params) => {
  return await request.get({ url: `/course/reg/list`, params })
}
export const getRegPage = async (params) => {
  return await request.get({ url: `/course/reg/page`, params })
}

// 查询课程安排详情
export const getReg = async (id: number) => {
  return await request.get({ url: `/course/reg/get?id=` + id })
}

// 新增课程安排
export const createReg = async (data: RegVO) => {
  return await request.post({ url: `/course/reg/create`, data })
}

// 修改课程安排
export const updateReg = async (data: RegVO) => {
  return await request.put({ url: `/course/reg/update`, data })
}

// 删除课程安排
export const deleteReg = async (id: number) => {
  return await request.delete({ url: `/course/reg/delete?id=` + id })
}

// 导出课程安排 Excel
export const exportReg = async (params) => {
  return await request.download({ url: `/course/reg/export-excel`, params })
}
