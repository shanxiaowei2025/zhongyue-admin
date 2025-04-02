// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  /** ID */
  id?: string; // 添加 id 字段，使用可选属性
  /** 角色名称 */
  name: string;
  /** 角色编号 */
  code: string;
  /** 备注 */
  remark: string;
  /** 状态 */
  status?: number; // 添加 status 字段，使用可选属性
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
