<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="上级ID" prop="pid">
        <el-input v-model="formData.pid" placeholder="请输入上级ID" />
      </el-form-item>
      <el-form-item label="课程标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入课程标题" />
      </el-form-item>
      <el-form-item label="周期开始时间" prop="startRecur">
        <el-input v-model="formData.startRecur" placeholder="请输入周期开始时间" />
      </el-form-item>
      <el-form-item label="周期结束时间" prop="endRecur">
        <el-input v-model="formData.endRecur" placeholder="请输入周期结束时间" />
      </el-form-item>
      <el-form-item label="可使用卡类型" prop="cardTypes">
        <el-input v-model="formData.cardTypes" placeholder="请输入可使用卡类型" />
      </el-form-item>
      <el-form-item label="颜色" prop="color">
        <el-input v-model="formData.color" placeholder="请输入颜色" />
      </el-form-item>
      <el-form-item label="文本颜色" prop="textColor">
        <el-input v-model="formData.textColor" placeholder="请输入文本颜色" />
      </el-form-item>
      <el-form-item label="边框颜色" prop="borderColor">
        <el-input v-model="formData.borderColor" placeholder="请输入边框颜色" />
      </el-form-item>
      <el-form-item label="背景颜色" prop="backgroundColor">
        <el-input v-model="formData.backgroundColor" placeholder="请输入背景颜色" />
      </el-form-item>
      <el-form-item label="URL" prop="url">
        <el-input v-model="formData.url" placeholder="请输入URL" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="顺序" prop="sort">
        <el-input v-model="formData.sort" placeholder="请输入顺序" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import * as RegApi from '@/api/course/reg'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  pid: undefined,
  title: undefined,
  startRecur: undefined,
  endRecur: undefined,
  cardTypes: undefined,
  color: undefined,
  textColor: undefined,
  borderColor: undefined,
  backgroundColor: undefined,
  url: undefined,
  remark: undefined,
  sort: undefined,
  status: undefined
})
const formRules = reactive({})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await RegApi.getReg(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as RegApi.RegVO
    if (formType.value === 'create') {
      await RegApi.createReg(data)
      message.success(t('common.createSuccess'))
    } else {
      await RegApi.updateReg(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    pid: undefined,
    title: undefined,
    startRecur: undefined,
    endRecur: undefined,
    cardTypes: undefined,
    color: undefined,
    textColor: undefined,
    borderColor: undefined,
    backgroundColor: undefined,
    url: undefined,
    remark: undefined,
    sort: undefined,
    status: undefined
  }
  formRef.value?.resetFields()
}
</script>
