<template>
  <el-row>
    <el-col :span="4">
      <div id="courseRegListItem">
        <div
          v-for="(item, index) in courseRegList"
          class="courseRegListItem"
          :draggable="true"
          :key="index"
          :id="item.id"
        >
          <el-tag :id="item.id" :color="item.color" class="mx-1" size="large" effect="light"
            >{{ item.title }}1
          </el-tag>
        </div>
      </div>
    </el-col>
    <el-col :span="20">
      <FullCalendar id="myCalendar1" ref="myCalendar" :options="calendarOptions" />
    </el-col>
  </el-row>
  <!-- 列表 -->
  <div id="course_table_member" style="display: none">
    <el-table v-loading="loading" :data="trainList" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="课程" align="center" prop="title" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['course:event:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['course:event:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="regList"
    />
  </div>
</template>
<script setup lang="ts">
import { addTime, dateFormatter, formatDate } from '@/utils/formatTime'
import { Calendar } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import luxonPlugin from '@fullcalendar/luxon'
import momentPlugin from '@fullcalendar/moment'
import resourceDayGridPlugin from '@fullcalendar/resource-daygrid'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'

import { menusEvent } from 'vue3-menus'

import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'

import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import * as EventApi from '@/api/course/event/index'
import * as EventTableApi from '@/api/course/table'
import * as EventRegApi from '@/api/course/reg/index'
import { any } from 'vue-types'

defineOptions({ name: 'Table', myCalendar: any })

const myCalendar = ref<InstanceType<typeof FullCalendar>>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数

const menus = shallowRef({
  menus: [
    {
      label: '保存',
      // icon: 'ep:check',
      // icon: {
      //   node: 'ep:check',
      //   option: {
      //     color: 'red'
      //   }
      // },
      divided: true,
      click: (e, event) => {
        debugger
        // let eventObj = {
        //   id: event.eventRange.def.publicId,
        //   startTime: formatDate(info.dateStr, 'HH:mm:ss'),
        //   endTime: formatDate(endTime, 'HH:mm:ss'),
        //   daysOfWeek: info.date.getDay()
        // }
        // updateCourseEvent(eventObj)
      }
    },
    {
      label: '重命名',
      // icon: 'ep:edit',
      divided: true,
      click: (e, event) => {
        eventNameChangBox('sdsd')
      }
    },
    {
      label: '删除',
      // icon: 'drag-icon',
      divided: true,
      click: (e, event) => {
        return false
      }
    }
  ]
})

/** 事件右键菜单 */
function rightClick(event) {
  debugger
  event.preventDefault()
  menusEvent(event, menus.value, event.currentTarget.fcSeg)
}

/** 修改课程名称-弹出框 */
const eventNameChangBox = (eventName) => {
  ElMessageBox.prompt('请输入要修改的课程名称', '提示', {
    inputValue: eventName,
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
    .then(({ value }) => {
      ElMessage({
        type: 'success',
        message: `Your email is:${value}`
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Input canceled'
      })
    })
}
// const courseRegList = ref([])
// const courseRegParams = ref([
//   {
//     id: '1',
//     title: '第一个任务',
//     start: '13:22:24',
//     color: '#FECACA',
//     textColor: '#6B7280'
//   }
// ])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: null,
  customerId: null,
  businessId: null,
  orderDate: [],
  no: null,
  ids: [],
  discountPercent: null,
  productPrice: null
})
const queryFormRef = ref() // 搜索的表单
let trainList = ref([])
const courseRegList = ref([])
const regList = async () => {
  loading.value = true
  try {
    const data = await EventRegApi.getRegList({})
    courseRegList.value = data
  } finally {
    loading.value = false
  }
}

/** 读取课程表 */
const loadEventTable = async () => {
  EventTableApi.getEventTable(queryParams).then((res) => {
    calendarOptions.events = res
  })
}

/** 新增事件 */
const addCourseEvent = async (params) => {
  loading.value = true
  try {
    const data = await EventApi.createEvent(params)
    if (data > 0) {
      message.notifySuccess('新增课表成功')
    }
    // courseRegList.value = data
  } finally {
    loading.value = false
  }
}
/** 保存事件 */
const updateCourseEvent = async (params) => {
  loading.value = true
  try {
    debugger
    const data = await EventApi.updateEvent(params)
    // courseRegList.value = data
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  // getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await EventApi.deleteEvent(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    // await getList()
  } catch {}
}

const dropItem = (info) => {
  let endTime = addTime(info.date, 3600000)
  const obj = {
    title: info.draggedEl.firstChild.innerText,
    courseId: info.draggedEl.id,
    startTime: formatDate(info.dateStr, 'HH:mm:ss'),
    endTime: formatDate(endTime, 'HH:mm:ss'),
    daysOfWeek: info.date.getDay(),
    status: 1,
    editable: true
  }
  addCourseEvent(obj).then((res) => {
    loadEventTable()
  })
}

const open1 = () => {
  // ElNotification({
  //   title: 'Title',
  //   message: h('i', { style: 'color: teal' }, 'This is a reminder')
  // })
  debugger
  let aEvent = {
    id: '1',
    title: '当天消课人数：30',
    resourceId: 112233,
    groupId: '',
    eventBackgroundColor: '#ff0000',
    allDay: true,
    interactive: true,
    eventInteractive: true,
    // color: '#461de1',
    // backgroundColor: '#68ff00',
    // borderColor: '#dc15c2',
    // textColor: '#ff0000',
    // display: 'list-item',
    start: '2023-10-23'
  }
  calendarOptions.events.push(aEvent)
  trainList = [
    {
      id: '1',
      title: '添加心大',
      resourceId: 112233,
      groupId: '1',
      eventBackgroundColor: '#ff00fb',
      // color: '#461de1',
      // backgroundColor: '#68ff00',
      // borderColor: '#dc15c2',
      // textColor: '#ff0000',
      display: 'list-item',
      daysOfWeek: '2,3,4',
      start: '2023-10-13',
      end: '2023-11-13',
      startTime: '14:30:00',
      endTime: '15:30:00',
      rendering: true,
      progressive: true,
      progressiveEventRendering: true,
      eventRendering: true,
      url: '',
      extendedProps: {
        department: 'a1',
        劳动者: '2'
      },
      description: 'a2',
      老师: '1'
    }
  ]
}

const open2 = () => {
  ElNotification({
    title: 'Prompt',
    message: 'This is a message that does not automatically close',
    duration: 0
  })
}

const handleEventDidMount = (arg) => {
  console.log('handleEventDidMount')
  const eventId = arg.event.id
  // 添加右键事件
  arg.el.addEventListener('contextmenu', (jsEvent) => {
    debugger
    rightClick(jsEvent)
  })

  if (arg.view.type == 'listWeek') {
  }
}

const calendarOptions = reactive({
  // 引入的插件，比如fullcalendar/daygrid，fullcalendar/timegrid引入后才可显示月，周，日
  ViewWillUnmount: handleViewWillUnmount, // 设置一周中显示的第一天是哪天，周日是0，周一是1，类推
  allDaySlot: true,
  allDayText: '全天',
  aspectRatio: 1.66,
  buttonIcons: {
    prev: 'chevron-left',
    next: 'chevron-right',
    prevYear: 'chevrons-left', // double chevron
    nextYear: 'chevrons-right' // double chevron
  },
  buttonText: {
    today: '今天',
    month: '月',
    week: '周',
    day: '日',
    list: '列表',
    resourceTimeGridWeek: '周(场地)',
    resourceTimeGridDay: '日(场地)',
    resourceTimelineWeek: '周(时间线)',
    resourceTimelineDay: '日(时间线)',
    resourceDayGridDay: '天'
  },
  // now:new Data,
  // theme : true,
  customButtons: {
    eventRegButton: {
      click: function () {
        regList()
      },
      text: 'custom!'
    },
    updateButton: {
      click: function () {
        updateCourseEvent()
      },
      text: '更新当前课程表'
    }
  }, // 切换语言，当前为中文
  // eventColor: '#3BB2E3', // 全部日历日程背景色
  //standard、bootstrap、
  dateClick: handleDateClick,
  datesAboveResources: true,
  dayMaxEventRows: true,
  dayMaxEvents: false, // 默认为那个视图（月：dayGridMonth，周：timeGridWeek，日：timeGridDay）
  displayEventEnd: true,
  drop: dropItem,
  // footerToolbar: {
  //   start: 'title'
  // },
  //     if (userInfo.tenant_id === '000000') {
  //   calendarOptions.headerToolbar.end = 'dayGridMonth,timeGridWeek,resourceTimeGridWeek,timeGridDay,resourceTimeGridDay,resourceTimelineWeek,resourceTimelineDay,resourceDayGridDay,listWeek'; // 通常在右边。如果是RTL，则在左侧
  // } else {
  //   calendarOptions.headerToolbar.end = 'dayGridMonth,timeGridWeek,timeGridDay,listWeek';
  // }
  dropAccept: '.courseRegListItem',
  droppable: true,
  editable: true,
  eventClick: handleEventClick,
  // customButtons: {
  //   prev: {
  //     text: '上月',
  //     click: handlePreBtnClick;
  //   },
  //   next: {
  //     // this overrides the next button
  //     text: '下月',
  //     click: handleNextBtnClick
  //   },
  //   prevYear: {
  //     text: '上一年',
  //     click: handlePreYearBtnClick
  //   },
  //   nextYear: {
  //     text: '下一年',
  //     click: handleNextYearBtnClick
  //   }
  // },
  // buttonIcons: {
  //   prev: 'left-single-arrow',
  //   next: 'right-single-arrow',
  //   prevYear: 'left-double-arrow',
  //   nextYear: 'right-double-arrow'
  // },
  eventDidMount: handleEventDidMount, //所有视图显示结束时间

  eventDragStart: handleEventDragStart,
  eventDragStop: handleEventDragStop,
  eventDrop: handleEventDrop,
  eventDurationEditable: true,
  eventLimit: true,
  eventMouseEnter: handleEventMouseEnter,
  eventMouseLeave: handleEventMouseLeave,
  // height: 'auto',
  eventResizableFromStart: true,
  // contentHeight: 'auto',
  eventResourceEditable: true,
  // moreLinkContent: function (arg) {
  //   let args = '还有' + arg.num + '个'
  //   return args
  // },
  eventStartEditable: true,
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  events: [
    {
      id: '1',
      title: '基础轮滑1',
      resourceId: 112233,
      groupId: '',
      eventBackgroundColor: '#ff0000',

      interactive: true,
      eventInteractive: true,
      // color: '#461de1',
      // backgroundColor: '#68ff00',
      // borderColor: '#dc15c2',
      // textColor: '#ff0000',
      // display: 'list-item',
      daysOfWeek: '2,3,4',
      start: '2023-10-13',
      end: '2023-11-13',
      startTime: '14:30:00',
      endTime: '15:30:00',
      url: '',
      extendedProps: {
        department: 'a1',
        劳动者: '2'
      },
      description: 'a2',
      老师: '1'
    },
    {
      id: '2',
      resourceId: 112233,
      eventBackgroundColor: '#ffec07',
      title: '花样轮滑2',
      groupId: '',
      start: '2021-12-23T17:00:00',
      end: '2024-12-23T18:00:00',
      startTime: '17:30:00',
      endTime: '18:30:00',
      // display: 'block',
      extendedProps: {
        department: 'b1'
      },
      description: 'b2'
      // backgroundColor: 'green',
      // borderColor: 'green',
      // display: 'background'
    },
    {
      id: '3',
      title: '启蒙3',
      resourceId: 112233,
      groupId: '',
      color: '#00ff05',
      // backgroundColor: '#68ff00',
      // borderColor: '#dc15c2',
      // textColor: '#ff0000',
      // display: 'background',
      daysOfWeek: '3',
      start: '2023-10-13',
      end: '2023-11-13',
      startTime: '10:30:00',
      endTime: '11:30:00',
      url: '',
      extendedProps: {
        department: 'a1',
        劳动者: '2'
      },
      description: 'a2',
      老师: '1'
    },
    {
      id: '4',
      title: '测试4',
      resourceId: 112233,
      groupId: '',
      color: '#174bf8',
      // backgroundColor: '#68ff00',
      // borderColor: '#dc15c2',
      // textColor: '#ff0000',
      // display: 'background',
      daysOfWeek: '3',
      start: '2013-10-13',
      end: '2024-11-13',
      startTime: '09:30:00',
      endTime: '10:30:00',
      url: '',
      extendedProps: {
        department: 'a1',
        劳动者: '2'
      },
      description: 'a2',
      老师: '1'
    }
  ],
  expandRows: true,
  filterResourcesWithEvents: false,
  firstDay: '1',
  headerToolbar: {
    start: 'title', // 通常在左边。如果是RTL，则在右边
    center: 'eventRegButton,updateButton',
    // 'dayGridMonth,timeGridWeek,resourceTimeGridWeek,timeGridDay,resourceTimeGridDay,resourceTimelineWeek,resourceTimelineDay,resourceDayGridDay,listWeek',
    end: 'dayGridMonth,dayGridWeek,timeGridWeek,list prev,today,next' // 通常在右边。如果是RTL，则在左侧
  },
  initialView: 'timeGridWeek', //数据条数太多时，限制显示条数（多余的以“+2more”格式显示），默认false不限制,支持输入数字设定固定的显示条数
  // moreLinkClick: handleMoreLinkClick,
  locale: 'zh-cn',

  // events: [],
  moreLinkContent: '更多~',
  // eventContent: function (arg) {
  //   let italicEl = document.createElement('span')
  //   italicEl.innerHTML =
  //     arg.timeText + '<br/>' + arg.event._def.title + '<br/>' + arg.event._def.extendedProps.劳动者
  //   italicEl.className = 'fc-bg-event-div'
  //   let arrayOfDomNodes = [italicEl]
  //   return {
  //     domNodes: arrayOfDomNodes
  //   }
  // },
  // businessHours: {
  //   // 是一个对象
  //   // days of week. an array of zero-based day of week integers (0=Sunday)
  //   // 天的星期。一个以零为基础的星期整数数组(0=星期日)
  //   daysOfWeek: [1, 2, 3, 4, 5], // 星期一 - 星期四
  //   startTime: '13:00', // a start time (10am in this example)
  //   endTime: '20:00' // an end time (6pm in this example)
  // },
  navLinkDayClick: handleNavLinkDayClick,
  // resources: [
  //   {
  //     id: '112233',
  //     eventColor: '#ff0029',
  //     resourceBackgroundColor: '#ff8200',
  //     title: '场地01',
  //     sort: 2
  //   },
  //   {
  //     id: '2',
  //     title: '场地02',
  //     sort: 1
  //   },
  //   {
  //     id: '3',
  //     title: '场地03',
  //     sort: 3
  //   },
  //   {
  //     id: '4',
  //     title: '场地04',
  //     sort: 4
  //   }
  // ],
  navLinkWeekClick: handleNavLinkWeekClick,
  navLinks: true,
  nowIndicator: true,
  // resourceLabelContent: function (arg, a, b, c) {
  //
  //     let italicEl = document.createElement('div')
  //
  //   // arg.view.calendar.el.style.backgroundColor='#f60';
  //
  //     // if (arg.event.extendedProps.isUrgent) {
  //     //   italicEl.innerHTML = 'urgent event'
  //     // } else {
  //     //   italicEl.innerHTML = 'normal event'
  //     // }
  //   italicEl.style.backgroundColor='#e90';
  //   italicEl.innerHTML = 'normal event'
  //     let arrayOfDomNodes = [ italicEl ]
  //     return { domNodes: arrayOfDomNodes }
  // },
  // 重写事件
  // eventContent: function (arg) {
  //   let italicEl = document.createElement('i')
  //
  //   if (arg.event.extendedProps.isUrgent) {
  //     italicEl.innerHTML = 'urgent event'
  //   } else {
  //     italicEl.innerHTML = 'normal event'
  //   }
  //
  //   let arrayOfDomNodes = [italicEl]
  //   return { domNodes: arrayOfDomNodes }
  // },
  plugins: [
    luxonPlugin,
    momentPlugin,
    interactionPlugin,
    dayGridPlugin,
    timeGridPlugin,
    listPlugin,
    resourceTimeGridPlugin,
    resourceTimelinePlugin,
    resourceDayGridPlugin
  ], //可被拖进
  resourceAreaColumns: [
    {
      field: 'title',
      headerContent: ''
    }
  ],
  resourceAreaWidth: '5%',
  // slotLabelContent: handleSlotLabelContent,
  resourceOrder: 'sort',
  schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
  selectEventOverlap: false,
  selectHelper: true,
  selectMirror: true,
  selectable: false,
  slotDuration: '00:60',

  slotEventOverlap: false,
  slotLabelInterval: '00:60',
  slotMaxTime: '20:00',
  slotMinTime: '09:00',
  snapDuration: '00:10',

  themeSystem: 'standard',

  viewDidMount: handleViewDidMount,
  views: {
    dayGrid: {
      // 选项适用于dayGridMonth、dayGridWeek和dayGridDay视图
    },
    timeGrid: {
      // 选项适用于timeGridWeek和timeGridDay视图
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 设置时间为24小时
      }
    },
    week: {
      // 选项适用于dayGridWeek和timeGridWeek视图
      weekNumbers: false
    },
    day: {
      // 选项适用于dayGridDay和timeGridDay视图
      weekNumbers: false
    },
    list: {
      // 选项适用于dayGridDay和timeGridDay视图
      weekNumbers: true
    }
    // resourceTimelineWeek: {
    //   weekNumbers: false,
    // },
    // resourceTimelineDay: {
    //   weekNumbers: false,
    // }
  },
  weekNumberCalculation: 'ISO',
  // eventResize: handleEventResizeStart,
  weekNumbers: true,
  weekText: '周'
  // select: handleSelect
})

function prev() {
  open2()

  FullCalendar.calendarApi.prev()
}

function handlePreBtnClick() {
  FullCalendar.calendarApi.prev()
}

// 切换下一个按钮事件
function next() {
  FullCalendar.calendarApi.next()
}

// 点击今天按钮
function today() {
  FullCalendar.calendarApi.today()
}

function handleDateClick(arg) {
  console.log('handleDateClick')
  // this.$notify({
  //   title: '提示',
  //   message: arg,
  //   duration: 0
  // });
}

function handleEventMouseEnter(arg) {
  // extendedProps: {
  //   department: 'a1',
  //     劳动者:'2'
  // },
  // description: 'a2',
  //   老师:'1'
  // arg.event._def.extendedProps
  //
  let text = '<h3>' + arg.event.title + '</h3>'
  text += '<h6> ' + formatDate(arg.event.start, 'yyyy-MM-dd') + '</h6>'
  text +=
    '<h6> ' +
    formatDate(arg.event.start, 'hh:mm:ss') +
    ' - ' +
    formatDate(arg.event.end, 'hh:mm:ss') +
    '</h6>'
  // text += 'id: ' + arg.event.extendedProps.department;

  const template = document.getElementById('course_table_member')
  tippy(arg.el, {
    content: template?.innerHTML, //悬浮框展示的内容
    appendTo: () => document.body,
    // appendTo: 'parent',
    trigger: 'click',
    animation: 'fade',
    theme: 'light',
    // theme: 'light-border',
    // theme: 'material',
    // interactive: true,
    // followCursor: true,
    // theme: 'translucent',
    // theme: 'tomato',    //自定义主题，颜色在style中设置
    allowHTML: true //为true的时候，可以识别content中的html
  })

  console.log(text)
}

function handleEventMouseLeave(arg) {
  let text = 'Event: ' + arg.event.title
  text += 'Coordinates: ' + arg.jsEvent.pageX + ',' + arg.jsEvent.pageY
  text += 'View: ' + arg.view.type
  // $message.success(text);
  // change the border color just for fun
  // info.el.style.borderColor = 'red';
}

function handleEventClick(arg) {
  console.log('handleEventClick')
  open1()
}

function handleEventDragStart(info) {
  console.log('handleEventDragStart')
  // let text = 'Event: ' + info.event.title;
  // text += 'Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY;
  // text += 'View: ' + info.view.type;
  // this.$message.success('handleEventDragStart')
  // change the border color just for fun
  // info.el.style.borderColor = 'red';
}

function handleEventDragStop(info) {
  console.log('handleEventDragStop')
  // let text = 'Event: ' + info.event.title;
  // text += 'Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY;
  // text += 'View: ' + info.view.type;
  // $message.success("handleEventDragStop");
  // change the border color just for fun
  // info.el.style.borderColor = 'red';
}

function handleEventDrop(arg) {
  console.log('handleEventDrop')
  alert('保存')
  // let dur = toLuxonDuration(arg.delta, myCalendar) // calendar is required
  // console.log('event moved ' + dur.toISO())
  // console.log(info.event.title + " was dropped on " + info.event.start.toISOString());
  //
  // if (!confirm("Are you sure about this change?")) {
  //   info.revert();
  // }
  // // change the border color just for fun
  // // info.el.style.borderColor = 'red';
}

function handleSelect(selectInfo) {
  console.log('handleSelect')
  // let _this = myCalendar
  // //
  // let title = prompt('Please enter a new title for your event')
  // let calendarApi = selectInfo.view.calendar
  // let a = calendarApi.getEvents();
  // if (title) {
  //   calendarApi.addEvent({
  //     id: '1',
  //     title,
  //     start: selectInfo.startStr,
  //     end: selectInfo.endStr,
  //     allDay: selectInfo.allDay,
  //     classNames: ['cal']
  //   })
  // }
}

function handleViewDidMount(arg) {
  let a = arg.view.getCurrentData

  if (arg.view.type == 'list') {
  } else if (arg.view.type == 'timeGridWeek') {
  } else if (arg.view.type == 'dayGridWeek') {
  } else if (arg.view.type == 'dayGridMonth') {
  }

  console.log('handleViewDidMount')
  console.log('activeStart   ' + formatDate(arg.view.activeStart))
  console.log('activeEnd     ' + formatDate(arg.view.activeEnd))
  console.log('currentStart  ' + formatDate(arg.view.currentStart))
  console.log('currentEnd    ' + formatDate(arg.view.currentEnd))
  console.log('type ' + arg.view.type)

  loadEventTable()

  // _this.$refs.myCalendar.getApi().addEventSource(data.records);
  // calendarOptions.events = data

  // let obj:typeof Object
  // obj.startRecur = formatDate(arg.view.activeStart)
  // obj.endRecur = formatDate(arg.view.activeEnd)
}

function handleViewWillUnmount(arg) {
  console.log('handleViewWillUnmount')
  EventTableApi.getEventTable(queryParams).then((res) => {
    // _this.$refs.myCalendar.getApi().addEventSource(data.records);
    // calendarOptions.events = JSON.parse(JSON.stringify(res))
    // calendarOptions.events = res
  })
}

function handleNavLinkDayClick(date, jsEvent) {
  // this.myCalendar.gotoDate(date.toISOString());
  // console.log('day', date.toISOString());
  // console.log('coords', jsEvent.pageX, jsEvent.pageY);
}

function handleNavLinkWeekClick(weekStart, jsEvent) {
  // console.log('week start', weekStart.toISOString());
  // console.log('coords', jsEvent.pageX, jsEvent.pageY);
}

function handleViewHint(weekStart, jsEvent) {
  // console.log('week start', weekStart.toISOString());
  // console.log('coords', jsEvent.pageX, jsEvent.pageY);
  return 'dsdsd'
}

/** 初始化 **/

onBeforeMount(() => {
  console.log('---onBeforeMount---')
})
onMounted(() => {
  console.log('---onMounted---')
  // regList()
  let a = document.getElementById('courseRegListItem')
  new Draggable(a, {
    itemSelector: '.courseRegListItem'
  })
})
onBeforeUpdate(() => {
  console.log('---onBeforeUpdate---')
})
onUpdated(() => {
  console.log('---onUpdated---')
})
onBeforeUnmount(() => {
  console.log('---onBeforeUnmount---')
})
onUnmounted(() => {
  console.log('---onUnmounted---')
})
onActivated(() => {
  console.log('---onActivated---')
})
onDeactivated(() => {
  console.log('---onDeactivated---')
})
onErrorCaptured(() => {
  console.log('---onErrorCaptured---')
})
</script>

<style lang="scss" scoped>
//::v-deep .fc-scrollgrid td {
//  height: 60px !important;
//}
:deep(a) {
  color: #000;
}

.color {
  position: relative;
  top: 2px;
  left: 0;
}

.fc-media-screen {
  height: calc(100vh - 152px);
}

.fc-datagrid-cell .fc-resource {
  background-color: #f3d19e;
}

.v-deep -webkit-scrollbar {
  width: 16px;
  height: 16px;
  background-color: transparent;
}

:deep(.el-dialog) {
  top: 0%;
  max-width: 100%;
  max-height: 100%;
  padding: 0;
}

:deep(.avue-dialog--top) {
  top: 0%;
  max-width: 100%;
  max-height: 100%;
  padding: 0;
}
</style>
<!--<style lang="scss" scoped>-->
<!--:deep(.v-footer) {-->
<!--  display: none;-->
<!--  visibility: hidden;-->
<!--  height: 0;-->
<!--}-->
<!--</style>-->
