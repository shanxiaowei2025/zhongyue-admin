<template>
  <div class="uploader-container">
    <el-upload
      ref="uploadRef"
      action=""
      :auto-upload="false"
      :show-file-list="false"
      :accept="acceptTypes"
      :multiple="multiple"
      :before-upload="handleBeforeUpload"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :file-list="fileList"
      :headers="headers"
      :data="props.data"
      :class="{ 'image-uploader': imageOnly }"
    >
      <template v-if="imageOnly">
        <div class="upload-list">
          <div
            v-for="index in remainingSlots"
            :key="index"
            class="upload-item"
            @click.stop="handleUploadClick"
          >
            <div v-if="fileList[index - 1]" class="image-container">
              <el-image
                :src="getFullUrl(fileList[index - 1].url)"
                class="preview-image"
                :preview-src-list="[getFullUrl(fileList[index - 1].url)]"
              />
              <div v-if="isUploading(index - 1)" class="upload-progress">
                <el-progress
                  type="circle"
                  :percentage="uploadProgress[fileList[index - 1].uid]"
                  :width="50"
                />
              </div>
              <div v-else class="image-overlay hover-show">
                <el-icon
                  class="operation-icon"
                  @click.stop="handlePreview(fileList[index - 1])"
                >
                  <ZoomIn />
                </el-icon>
                <el-icon
                  class="operation-icon"
                  @click.stop="handleRemove(fileList[index - 1])"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
            <el-icon
              v-else-if="index === fileList.length + 1"
              class="upload-icon"
            >
              <Plus />
            </el-icon>
          </div>
        </div>
      </template>
      <template v-else>
        <el-button type="primary" @click.stop="handleUploadClick">
          <el-icon><Upload /></el-icon>
          <span>点击上传</span>
        </el-button>
      </template>
    </el-upload>

    <el-dialog v-model="previewVisible" title="预览">
      <img v-if="previewUrl" :src="previewUrl" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus, Delete, ZoomIn, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { UploadInstance } from "element-plus";
import type {
  UploadProps,
  UploadEmits,
  UploadFile,
  UploadFiles
} from "../types";
import { getUploadUrl } from "@/api/upload";

// Props 定义
const props = withDefaults(defineProps<UploadProps>(), {
  maxCount: 1,
  maxSize: 5,
  accept: () => [],
  multiple: true,
  imageOnly: false,
  showFileList: true,
  directory: "",
  headers: () => ({}),
  data: () => ({})
});

const emit = defineEmits<UploadEmits>();

// 状态管理
const uploadRef = ref<UploadInstance>();
const fileList = ref<UploadFile[]>([]);
const previewVisible = ref(false);
const previewUrl = ref("");
const uploadingFiles = ref<Set<string>>(new Set());
const uploadProgress = ref<Record<string | number, number>>({});

// 计算属性
const remainingSlots = computed(() => {
  const maxCount = props.maxCount || 1;
  const currentCount = fileList.value.length;
  return currentCount < maxCount ? currentCount + 1 : currentCount;
});

const acceptTypes = computed(() => props.accept.join(","));

// 工具函数
const getFullUrl = (path?: string) => {
  if (!path) return "";
  return `${import.meta.env.VITE_MINIO_DOMAIN}/${import.meta.env.VITE_MINIO_BUCKET}/${path}`;
};

const isUploading = (index: number) => {
  const file = fileList.value[index];
  return file && uploadingFiles.value.has(String(file.uid));
};

// 文件处理函数
const handleBeforeUpload = async (file: File) => {
  if (file.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB!`);
    return false;
  }

  if (
    props.accept.length &&
    !props.accept.some(
      type =>
        file.type.startsWith(type) || file.name.endsWith(type.replace(".", ""))
    )
  ) {
    ElMessage.error(`只能上传 ${props.accept.join(", ")} 格式的文件!`);
    return false;
  }

  return true;
};

const handleChange = async (
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  const file = uploadFile.raw as File;
  if (!file) return;

  if (!props.name) {
    ElMessage.error("上传组件缺少 name 属性");
    return;
  }

  fileList.value = [...fileList.value, uploadFile];
  uploadingFiles.value.add(String(uploadFile.uid));
  uploadProgress.value[uploadFile.uid] = 0;

  try {
    const progressInterval = setInterval(() => {
      if (uploadProgress.value[uploadFile.uid] < 90) {
        uploadProgress.value[uploadFile.uid] += 10;
      }
    }, 200);

    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    const extension = file.name.split(".").pop();
    const filename = `${props.name}_${timestamp}.${extension}`;

    const uploadRes = await getUploadUrl({
      filename,
      content_type: file.type,
      subdirectory: props.directory || "default"
    });

    if (!uploadRes.success) throw new Error("获取上传URL失败");

    const response = await fetch(uploadRes.data.url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type, ...props.headers }
    });

    if (!response.ok) {
      clearInterval(progressInterval);
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    uploadProgress.value[uploadFile.uid] = 100;
    clearInterval(progressInterval);

    const index = fileList.value.findIndex(f => f.uid === uploadFile.uid);
    if (index > -1) {
      fileList.value[index] = {
        ...uploadFile,
        url: uploadRes.data.path,
        status: "success"
      };
    }

    const updateValue = fileList.value.map(f => f.url || "");
    emit("update:modelValue", updateValue);
    emit("success", uploadFile);
    ElMessage.success("上传成功");

    setTimeout(() => {
      delete uploadProgress.value[uploadFile.uid];
      uploadingFiles.value.delete(String(uploadFile.uid));
    }, 500);
  } catch (error) {
    emit("error", uploadFile);
    ElMessage.error("上传失败");

    delete uploadProgress.value[uploadFile.uid];
    uploadingFiles.value.delete(String(uploadFile.uid));

    const index = fileList.value.findIndex(f => f.uid === uploadFile.uid);
    if (index > -1) {
      fileList.value.splice(index, 1);
    }
  }
};

const handleRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid);
  if (index > -1) {
    fileList.value.splice(index, 1);
    emit(
      "update:modelValue",
      fileList.value.map(f => f.url || "")
    );
    emit("remove", file);
  }
};

const handleExceed = (files: File[]) => {
  ElMessage.warning(`最多只能上传 ${props.maxCount} 个文件`);
  emit("exceed", files);
};

const handlePreview = (file: UploadFile) => {
  if (file.url) {
    previewUrl.value = getFullUrl(file.url);
    previewVisible.value = true;
  }
};

const handleUploadClick = async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  // 先执行父组件传入的 beforeUpload 验证
  if (props.beforeUpload) {
    const canUpload = await props.beforeUpload(undefined); // 不传入 file 参数，表示是点击验证
    if (!canUpload) {
      return; // 如果验证失败，直接返回，不打开文件选择框
    }
  }

  // 验证通过，打开文件选择框
  (
    uploadRef.value?.$el.querySelector('input[type="file"]') as HTMLInputElement
  )?.click();
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    const values = Array.isArray(newValue) ? newValue : [];
    fileList.value = values.map((path, index) => ({
      uid: index,
      name: path.split("/").pop() || "",
      url: path,
      status: "success"
    }));
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.uploader-container {
  width: 100%;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 150px;
  max-width: 100%;
}

.upload-item {
  width: 150px;
  height: 150px;
  flex: 0 0 auto;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;

  &:hover {
    border-color: #409eff;
  }
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;

  &:hover {
    .hover-show {
      opacity: 1;
    }
  }
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.upload-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 6px;

  .operation-icon {
    color: #fff;
    font-size: 32px;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.2);
    }
  }
}

.upload-icon {
  font-size: 32px;
  color: #909399;
}
</style>
