# 服务合同模板

> 变量说明：`{{变量名}}` 为必填项，`{{变量名|默认值}}` 为有默认值的可选项

---

## 合同头部信息

```
服务合同

合同编号：{{contract_number|（如有）}}

甲方（委托方）：{{client_name}}
地址：{{client_address}}
统一社会信用代码：{{client_credit_code|（如有）}}
联系人：{{client_contact}}
联系电话：{{client_phone}}

乙方（服务方）：{{provider_name}}
地址：{{provider_address}}
统一社会信用代码：{{provider_credit_code|（如有）}}
联系人：{{provider_contact}}
联系电话：{{provider_phone}}
```

---

## 第一条 服务内容

```
乙方向甲方提供以下服务：
{{service_description}}

服务交付标准：{{delivery_standards|按双方另行确认的需求文件执行。}}
服务地点：{{service_location|线上远程/乙方场所/甲方场所}}
```

---

## 第二条 服务期限

```
本合同服务期限自 {{service_start_date}} 起至 {{service_end_date}} 止。
如需延长，双方应提前 {{extension_notice_days|15}} 个工作日书面协商并签署补充协议。
```

---

## 第三条 合同金额及付款方式

```
本合同服务费用总计人民币（大写）{{total_amount_cn}} 元
（小写：¥{{total_amount}}），{{tax_inclusion|含}}增值税。

付款安排：
- 合同签署后 {{days_after_signing|5}} 个工作日内，支付预付款 {{deposit_ratio|30}}%
- 验收通过后 {{days_after_acceptance|10}} 个工作日内，支付尾款

付款方式：银行转账至乙方指定账户。
逾期付款违约金：每逾期一日，按逾期金额的 {{late_fee_rate|0.05}}% 计算。
```

---

## 第四条 验收

```
甲方收到交付物后 {{acceptance_period|7}} 个工作日内完成验收并出具书面意见。
期限内未提出书面异议的，视为验收通过。
验收标准：{{acceptance_criteria|符合本合同第一条约定及行业通行标准。}}
```

---

## 第五条 保密条款

```
双方对在合同履行中获取的对方保密信息承担保密义务，
未经书面同意不得向第三方披露。
保密义务在合同终止后 {{post_contract_confidentiality|3}} 年内继续有效。
```

---

## 第六条 知识产权

```
乙方在履行本合同过程中为甲方创作的全部成果，
其知识产权归{{ip_owner|甲方}}所有。
（如归乙方所有，则乙方授予甲方永久、全球范围内的使用权。）
```

---

## 第七条 违约责任

```
乙方逾期交付：每逾期一日，支付合同总额 {{delay_penalty_rate|0.1}}% 的违约金。
逾期超过 {{max_delay_days|30}} 日，甲方有权解除合同并要求赔偿损失。
甲方提前终止合同：应支付已完成工作对应费用，并支付剩余金额 {{early_termination_penalty|20}}% 违约金。
```

---

## 第八条 争议解决

```
双方友好协商；协商不成，提交{{jurisdiction|甲方所在地}}人民法院管辖。
本合同适用中华人民共和国法律。
```

---

## 第九条 其他

```
本合同自双方签章之日起生效，一式两份，各执一份。
{{additional_terms|}}
```

---

## 签署区

```
甲方（盖章）：                        乙方（盖章）：
授权代表（签字）：                    授权代表（签字）：
签署日期：    年    月    日          签署日期：    年    月    日
签署地点：{{sign_location}}
```
