# China Contract Skill 🇨🇳

**自动生成符合中国法律的劳动合同和服务合同（.docx 格式）**

基于《劳动合同法》（2013修）和《民法典》合同编（2021）。

## 支持合同类型
| 合同类型 | 法律依据 | 适用场景 |
|----------|----------|----------|
| 劳动合同 | 《劳动合同法》2013修 | 雇佣全职/兼职员工 |
| 服务合同 | 《民法典》合同编 2021 | 外包、供应商、顾问服务 |

## 安装
```bash
# Claude Code / OpenClaw
git clone https://github.com/YOUR_USERNAME/china-contract-skill ~/.claude/skills/china-contract

# Claude.ai 网页版：下载 ZIP → Customize → Skills → "+" → Upload ZIP
```

## 使用方式
安装后直接描述需求：
```
"帮我起草一份劳动合同，员工叫张三，3年期，月薪15000，上海"
"我要和设计公司签服务合同，服务费20万，帮我生成"
```

Skill 会自动识别合同类型、追问缺失字段、校验法律合规性，输出 `.docx` 文件。

## 法律覆盖
- ✅ 《劳动合同法》第17条必备条款
- ✅ 试用期时长上限自动校验
- ✅ 试用期工资下限提醒（正式工资80%或最低工资取高）
- ✅ 违约金限制（仅允许服务期和竞业限制两种情形）
- ✅ 五险缴纳义务条款
- ✅ 经济补偿金计算规则

## 文件结构
```
china-contract-skill/
├── SKILL.md                      ← AI 调用入口
├── references/legal-clauses.md   ← 法律条款参考库
├── templates/labor-contract.md   ← 劳动合同模板
├── templates/service-contract.md ← 服务合同模板
├── scripts/generate.js           ← docx 生成脚本
└── examples/                     ← 示例数据
```

## 免责声明
本 Skill 生成的合同仅供参考。实际使用前建议由具备中国执业资格的劳动法律师审阅。

## License
MIT
