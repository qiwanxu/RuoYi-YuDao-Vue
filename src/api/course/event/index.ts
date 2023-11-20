import request from '@/config/axios'

export interface EventVO {
  id: number
  pid: number
  resourceId: number
  groupId: string
  courseId: number
  title: string
  daysOfWeek: string
  startTime: Date
  endTime: Date
  startRecur: Date
  endRecur: Date
  color: string
  textColor: string
  borderColor: string
  backgroundColor: string
  url: string
  status: byte
}

// 查询课程(事件)列表
export const getEventPage = async (params) => {
  return await request.get({ url: `/course/event/page`, params })
}

// 查询课程(事件)详情
export const getEvent = async (id: number) => {
  return await request.get({ url: `/course/event/get?id=` + id })
}

// 新增课程(事件)
export const createEvent = async (data: EventVO) => {
  return await request.post({ url: `/course/event/create`, data })
}

// 修改课程(事件)
export const updateEvent = async (data: EventVO) => {
  return await request.put({ url: `/course/event/update`, data })
}

// 删除课程(事件)
export const deleteEvent = async (id: number) => {
  return await request.delete({ url: `/course/event/delete?id=` + id })
}

// 导出课程(事件) Excel
export const exportEvent = async (params) => {
  return await request.download({ url: `/course/event/export-excel`, params })
}
