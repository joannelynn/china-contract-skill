#!/usr/bin/env node
/**
 * china-contract-skill: generate.js
 * 依据用户模版（劳动合同通用标准版）生成 .docx
 * 依赖: npm install docx
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, Header, Footer,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── CLI 参数 ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const typeIdx = args.indexOf('--type');
const dataIdx = args.indexOf('--data');
const outIdx  = args.indexOf('--out');

const contractType = typeIdx !== -1 ? args[typeIdx + 1] : 'labor';
const rawData      = dataIdx !== -1 ? JSON.parse(args[dataIdx + 1]) : {};
const outputPath   = outIdx  !== -1 ? args[outIdx  + 1]
  : path.join(process.cwd(), generateFilename(contractType, rawData));

function generateFilename(type, data) {
  const party = data['乙方姓名'] || data['乙方名称'] || '乙方';
  const label  = type === 'labor' ? '劳动合同' : '服务合同';
  const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${party}_${label}_${today}.docx`;
}

// ── 样式常量 ────────────────────────────────────────────────────
const FONT_ZH   = '宋体';
const FONT_HEI  = '黑体';
const C_BLACK   = '000000';
const C_GREY    = '888888';
const C_LGREY   = 'CCCCCC';

// A4 页面
const PAGE_W = 11906, PAGE_H = 16838;
const MARGIN = { top: 1440, bottom: 1440, left: 1800, right: 1440 };
const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right; // 8666 DXA

// ── 基础元素 ─────────────────────────────────────────────────────

function run(text, opts = {}) {
  return new TextRun({
    text,
    font: { name: opts.font || FONT_ZH },
    size: opts.size || 24,
    bold: opts.bold || false,
    color: opts.color || C_BLACK,
  });
}

function p(children, opts = {}) {
  if (typeof children === 'string') children = [run(children)];
  return new Paragraph({
    children,
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: {
      before: opts.before !== undefined ? opts.before : 80,
      after:  opts.after  !== undefined ? opts.after  : 80,
      line: 360,
    },
    indent: opts.firstLine ? { firstLine: 480 } : undefined,
  });
}

function blank(h = 60) {
  return new Paragraph({ children: [run('')], spacing: { before: 0, after: h } });
}

// 文档主标题（黑体 22pt 居中）
function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: { name: FONT_HEI }, size: 44, bold: true, color: C_BLACK })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
  });
}

// 合同编号副行（右对齐，灰色小字）
function contractNo(text) {
  return new Paragraph({
    children: [run(text, { size: 20, color: C_GREY })],
    alignment: AlignmentType.RIGHT,
    spacing: { before: 0, after: 200 },
  });
}

// 二级标题（黑体 13pt + 底边线）
function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: { name: FONT_HEI }, size: 26, bold: true, color: C_BLACK })],
    spacing: { before: 240, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA', space: 4 } },
  });
}

// 三级标题（宋体加粗）
function h3(text) {
  return new Paragraph({
    children: [run(text, { bold: true })],
    spacing: { before: 140, after: 60 },
    indent: { firstLine: 480 },
  });
}

// 首行缩进正文
function body(children, opts = {}) {
  if (typeof children === 'string') children = [run(children)];
  return p(children, { firstLine: true, ...opts });
}

// 无缩进正文
function ni(children, opts = {}) {
  if (typeof children === 'string') children = [run(children)];
  return p(children, opts);
}

// 列表项（数字编号，悬挂缩进）
function li(num, text) {
  return new Paragraph({
    children: [run(`${num}.  ${text}`)],
    indent: { left: 480, hanging: 480 },
    spacing: { before: 60, after: 60, line: 360 },
  });
}

// ── 边框 ─────────────────────────────────────────────────────────
const bdrSolid = { style: BorderStyle.SINGLE, size: 6, color: C_BLACK };
const bdrNone  = { style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' };
const allSolid = { top: bdrSolid, bottom: bdrSolid, left: bdrSolid, right: bdrSolid };
const allNone  = { top: bdrNone,  bottom: bdrNone,  left: bdrNone,  right: bdrNone  };

// ── 单元格 ────────────────────────────────────────────────────────
function td(children, opts = {}) {
  if (!Array.isArray(children)) children = [children];
  return new TableCell({
    children,
    width: opts.w ? { size: opts.w, type: WidthType.DXA } : undefined,
    borders: opts.borders || allSolid,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    columnSpan: opts.span,
  });
}

// ── 甲/乙方信息表（双列，左列加粗，带实线边框） ──────────────────
function partyTable(rows) {
  const colL = Math.round(CONTENT_W * 0.33);
  const colR = CONTENT_W - colL;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [colL, colR],
    rows: rows.map(([label, value]) =>
      new TableRow({ children: [
        td(p([run(label, { bold: true })], { before: 60, after: 60 }), { w: colL }),
        td(p([run(value || '')],           { before: 60, after: 60 }), { w: colR }),
      ]})
    ),
  });
}

// ── 签字区（两栏，无边框） ────────────────────────────────────────
function signTable(leftRows, rightRows) {
  const colW = Math.round(CONTENT_W / 2);
  function signCell(rows) {
    return td(rows.map(r => ni([run(r)], { before: 80, after: 80 })), { w: colW, borders: allNone });
  }
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [colW, colW],
    borders: { top: bdrNone, bottom: bdrNone, left: bdrNone, right: bdrNone, insideH: bdrNone, insideV: bdrNone },
    rows: [new TableRow({ children: [signCell(leftRows), signCell(rightRows)] })],
  });
}

// ── 劳动合同正文 ──────────────────────────────────────────────────
function buildLaborContract(d) {
  const els = [];

  // 标题 + 编号
  els.push(h1('劳动合同（通用标准版）'));
  els.push(blank(40));
  els.push(contractNo(`合同编号：${d['合同编号'] || '___________'}`));

  // 甲方
  els.push(h2('甲方（用人单位）'));
  els.push(blank(40));
  els.push(partyTable([
    ['公司全称',               d['甲方公司名称']     || ''],
    ['统一社会信用代码',        d['甲方信用代码']     || ''],
    ['法定代表人 / 主要负责人', d['甲方法定代表人']   || ''],
    ['注册地址',               d['甲方地址']         || ''],
    ['联系电话',               d['甲方电话']         || ''],
  ]));
  els.push(blank());

  // 乙方
  els.push(h2('乙方（劳动者）'));
  els.push(blank(40));
  els.push(partyTable([
    ['姓名',           d['乙方姓名']       || ''],
    ['身份证号码',      d['乙方身份证号']   || ''],
    ['联系电话',        d['乙方电话']       || ''],
    ['住址',           d['乙方住址']       || ''],
    ['紧急联系人及电话', d['乙方紧急联系人'] || ''],
  ]));
  els.push(blank());

  // 引言
  els.push(body('甲乙双方根据《中华人民共和国劳动法》《中华人民共和国劳动合同法》及相关法律法规，遵循合法、公平、平等自愿、协商一致、诚实信用原则，订立本合同。'));
  els.push(blank());

  // 第一条 合同期限
  els.push(h2('第一条　合同期限'));
  const type = d['合同类型'] || '固定期限';
  const typeNum = type === '固定期限' ? '1' : type === '无固定期限' ? '2' : '3';
  els.push(body([run('本合同为下列第'), run(typeNum, { bold: true }), run('种形式：')]));
  els.push(li('1', `固定期限：自${d['合同开始日期'] || '____年__月__日'}起至${d['合同结束日期'] || '____年__月__日'}止。`));
  els.push(li('2', `无固定期限：自${d['合同开始日期'] || '____年__月__日'}起。`));
  els.push(li('3', `以完成一定工作任务为期限：自${d['合同开始日期'] || '____年__月__日'}起至${d['任务描述'] || '__________'}工作完成时即终止。`));
  els.push(blank(40));
  els.push(body(`试用期：自${d['试用期开始日期'] || '____年__月__日'}起至${d['试用期结束日期'] || '____年__月__日'}止，最长不超过 6 个月。合同期限 3 个月以上不满 1 年的，试用期不得超过 1 个月；1 年以上不满 3 年的，试用期不得超过 2 个月；3 年以上固定期限和无固定期限的，试用期不得超过 6 个月。以完成一定工作任务为期限或期限不满 3 个月的，不得约定试用期。试用期包含在劳动合同期限内。`));

  // 第二条 工作内容
  els.push(h2('第二条　工作内容与工作地点'));
  els.push(ni([run('乙方岗位：'), run(d['工作岗位'] || '________________________')]));
  els.push(ni([run('工作地点：'), run(d['工作地点'] || '________________________')]));
  els.push(body('甲方应明确乙方岗位职责、工作标准、考核要求；乙方应按要求完成工作任务，接受甲方合法管理。'));

  // 第三条 工作时间
  els.push(h2('第三条　工作时间和休息休假'));
  const ws = d['工作时间制度'] || '标准工时制';
  const wsNum = ws === '标准工时制' ? '1' : ws === '综合计算工时制' ? '2' : '3';
  els.push(body([run('甲方依法实行以下第'), run(wsNum, { bold: true }), run('种工时制度：1. 标准工时制；2. 综合计算工时制（经行政审批）；3. 不定时工作制（经行政审批）。')]));
  els.push(body('标准工时：每日不超过 8 小时，每周不超过 40 小时，每周至少休息 1 日。'));
  els.push(body('甲方依法保障乙方带薪年休假、法定节假日、婚假、产假、陪产假、丧假等休息休假权利。'));
  els.push(h3('加班工资'));
  els.push(ni('工作日加班：不低于工资的 150%'));
  els.push(ni('休息日加班不能安排补休：不低于工资的 200%'));
  els.push(ni('法定节假日加班：不低于工资的 300%'));

  // 第四条 劳动报酬
  els.push(h2('第四条　劳动报酬'));
  els.push(body([run('甲方每月'), run(d['发薪日'] || '__', { bold: true }), run('日前以货币形式足额支付工资，不得无故拖欠、克扣。')]));
  els.push(ni([run('乙方正常工作时间工资：税前 '), run(d['月基本工资'] ? `${d['月基本工资']} 元` : '__________ 元', { bold: true }), run(' / 月。')]));
  els.push(body('试用期工资不低于约定工资的 80%，且不低于当地最低工资标准。'));
  els.push(body('甲方可根据经营效益、岗位调整、考核结果依法调整乙方工资。'));

  // 第五条 社会保险
  els.push(h2('第五条　社会保险'));
  els.push(body('甲乙双方依法参加养老保险、医疗保险、失业保险、工伤保险、生育保险。甲方按时足额缴纳社会保险费，乙方个人应缴纳部分由甲方从工资中代扣代缴。'));

  // 第六条 劳动保护
  els.push(h2('第六条　劳动保护、劳动条件和职业危害防护'));
  els.push(body('甲方提供符合国家规定的劳动安全卫生条件和必要劳动防护用品，开展安全培训。对存在职业危害的岗位，应如实告知并采取防护措施，定期组织职业健康检查。'));

  // 第七条 规章制度
  els.push(h2('第七条　规章制度与劳动纪律'));
  els.push(body('甲方依法制定、经民主程序并公示的规章制度，对双方具有约束力。乙方应遵守劳动纪律和规章制度，服从合法管理。'));

  // 第八条 保密竞业
  els.push(h2('第八条　保密义务与竞业限制'));
  els.push(body('乙方对甲方商业秘密、技术秘密承担保密义务，在职及离职后均不得泄露。'));
  els.push(body('竞业限制仅限于高级管理人员、高级技术人员及其他负有保密义务的人员，期限最长不超过 2 年。甲方在竞业限制期内按月支付经济补偿，标准不低于合同履行地最低工资标准。'));

  // 第九条 变更解除终止
  els.push(h2('第九条　合同的变更、解除、终止与经济补偿'));
  els.push(body('变更劳动合同应采用书面形式，双方各执一份。'));
  els.push(body('乙方提前 30 日书面通知可解除劳动合同；试用期内提前 3 日通知。'));
  els.push(body('甲方依法解除或终止劳动合同，应出具解除 / 终止证明，并在 15 日内为乙方办理档案和社会保险关系转移手续。符合法定情形的，应支付经济补偿。经济补偿按劳动者在本单位工作年限，每满一年支付一个月工资；六个月以上不满一年的，按一年计算；不满六个月的，支付半个月工资。'));

  // 第十条 违约责任
  els.push(h2('第十条　违约责任'));
  els.push(body('任何一方违反本合同给对方造成损失的，依法承担赔偿责任。'));
  els.push(body('除服务期、竞业限制两种情形外，甲方不得与乙方约定由乙方承担违约金。'));

  // 第十一条 争议解决
  els.push(h2('第十一条　争议解决'));
  els.push(body('因履行本合同发生争议，双方可协商解决；协商不成的，可向当地劳动人事争议仲裁委员会申请仲裁；对仲裁裁决不服的，可依法向人民法院提起诉讼。'));

  // 结尾
  els.push(blank());
  els.push(body('本合同一式两份，甲乙双方各执一份，具有同等法律效力，自双方签字或盖章之日起生效。甲方应将合同文本交付乙方持有。'));
  els.push(blank(200));

  // 签字区
  const signDate = d['签订日期'] || '____年__月__日';
  els.push(signTable(
    ['甲方（盖章）', '', `法定代表人 / 授权代表：`, '', `日期：${signDate}`],
    ['乙方（签字）', '', '', '', `日期：${signDate}`],
  ));

  return els;
}

// ── 主函数 ───────────────────────────────────────────────────────
async function main() {
  const children = buildLaborContract(rawData);

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: { name: FONT_ZH }, size: 24, color: C_BLACK } },
      },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: { name: FONT_HEI }, size: 44, bold: true },
          paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: { name: FONT_HEI }, size: 26, bold: true },
          paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: { name: FONT_ZH }, size: 24, bold: true },
          paragraph: { spacing: { before: 140, after: 60 }, outlineLevel: 2 } },
      ],
    },
    sections: [{
      properties: {
        page: { size: { width: PAGE_W, height: PAGE_H }, margin: MARGIN },
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          children: [run('劳动合同（通用标准版）', { size: 18, color: C_GREY })],
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C_LGREY, space: 4 } },
        })]}),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          children: [
            run('第 ', { size: 18, color: C_GREY }),
            new TextRun({ children: [PageNumber.CURRENT], font: { name: FONT_ZH }, size: 18, color: C_GREY }),
            run(' 页', { size: 18, color: C_GREY }),
          ],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C_LGREY, space: 4 } },
        })]}),
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ 合同已生成：${outputPath}`);
}

main().catch(err => {
  console.error('❌ 生成失败：', err.message);
  process.exit(1);
});
