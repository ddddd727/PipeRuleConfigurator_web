import Mock from "mockjs";

// 树结构数据
Mock.mock(/\/api\/pipe-spec\/tree/, "get", () => ({
  code: 200,
  msg: "success",
  data: [
    {
      label: "PMC编码",
      children: [
        {
          label: "碳钢管",
          children: [
            {
              label: "GB/T 8163",
              children: [
                { label: "1C181AD" },
                { label: "1C181AE" },
                { label: "1C181AJ" },
              ],
            },
            {
              label: "GB/T 5312",
              children: [
                { label: "1C281AD" },
                { label: "1C281AE" },
                { label: "1C281AJ" },
              ],
            },
          ],
        },
        {
          label: "不锈钢",
          children: [
            {
              label: "GB/T 14976",
              children: [
                { label: "1S181AD" },
                { label: "1S181AE" },
                { label: "1S181AJ" },
              ],
            },
          ],
        },
      ],
    },
  ],
}));

// 物料数据
Mock.mock(/\/api\/pipe-spec\/material/, "get", () => ({
  code: 200,
  msg: "success",
  data: Mock.mock([
    { id: 1, name: "碳钢 (CS)" },
    { id: 2, name: "不锈钢 (SS304)" },
    { id: 3, name: "不锈钢 (SS316)" },
    { id: 4, name: "合金钢 (Alloy Steel)" },
    { id: 5, name: "铜合金 (Copper Alloy)" },
    { id: 6, name: "铝合金 (Aluminum Alloy)" },
    { id: 7, name: "钛合金 (Titanium Alloy)" },
  ]),
}));

// 尺寸数据
Mock.mock(/\/api\/pipe-spec\/dimension/, "get", () => {
  // 生成包含NPD等参数的表格数据
  const generateColumnData = (count) => {
    const data = [];
    // 添加NPD行
    const npdRow = {
      id: 1,
      name: "NPD",
    };
    // 添加其他参数行
    const paramNames = ["DN", "Thickness"];
    paramNames.forEach((name, index) => {
      const row = {
        id: index + 2,
        name: name,
      };
      // 为每行生成20个col字段
      for (let i = 1; i <= 20; i++) {
        if (name === "NPD") {
          row[`col${i}`] = 5 * i; // NPD按5递增
        } else {
          row[`col${i}`] = Mock.mock("@float(0, 500, 0 , 1)");
        }
      }
      data.push(row);
    });
    // 最后添加NPD行
    for (let i = 1; i <= 20; i++) {
      npdRow[`col${i}`] = 5 * i;
    }
    data.unshift(npdRow);
    return data;
  };

  return {
    code: 200,
    msg: "success",
    data: generateColumnData(),
  };
});

// 标准文件列表
Mock.mock(/\/api\/pipe-spec\/standard-files/, "get", () => ({
  code: 200,
  msg: "success",
  data: Mock.mock({
    "data|9-15": [
      {
        "id|+1": 1,
        name: "@ctitle(10, 20)",
        code: /GB\/T \d{4}-\d{4}/,
      },
    ],
  }).data,
}));

// 船级列表
Mock.mock(/\/api\/pipe-spec\/ship-classes/, "get", () => ({
  code: 200,
  msg: "success",
  data: [
    { id: 1, name: "民船" },
    { id: 2, name: "邮轮" },
    { id: 3, name: "海洋工程" },
  ],
}));

// 船号列表（根据船级ID过滤）
Mock.mock(/\/api\/pipe-spec\/ship-numbers/, "get", (options) => {
  const url = new URL(options.url, "http://localhost");
  const shipClassId = url.searchParams.get("shipClassId");

  return {
    code: 200,
    msg: "success",
    data: Mock.mock({
      "data|3-6": [
        {
          "id|+1": 1,
          name: shipClassId
            ? `H${shipClassId}@string("number", 3)`
            : '@ctitle(2, 3)@string("number", 3)',
          shipClassId: shipClassId || "@integer(1, 5)",
        },
      ],
    }).data,
  };
});

// 配置保存接口
Mock.mock(/\/api\/pipe-spec\/configure/, "post", () => ({
  code: 200,
  msg: "success",
  data: {
    id: Mock.mock("@integer(1000, 9999)"),
    success: true,
  },
}));

// 管道规格数据接口（根据ID获取）
Mock.mock(/\/api\/pipe-spec\/specification/, "get", (options) => {
  const urlParts = options.url.split("/");
  const id = urlParts[urlParts.length - 1];

  return {
    code: 200,
    msg: "success",
    data: Mock.mock({
      id: parseInt(id) || "@integer(1, 100)",
      name: "@ctitle(10, 20)",
      description: "@cparagraph(1, 3)",
      standardFile: "@ctitle(8, 15)",
      shipClass: "@ctitle(4, 6)",
      shipNumber: '@string("number", 5)',
      createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
      updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    }),
  };
});

// 管件配置详情接口
Mock.mock(/\/api\/pipe-spec\/fitting-config/, "get", (options) => {
  const url = new URL(options.url, "http://localhost");
  const specId = url.searchParams.get("specId");

  return {
    code: 200,
    msg: "success",
    data: Mock.mock({
      "data|8-12": [
        {
          "id|+1": 1,
          specId: specId || "@integer(1, 100)",
          fittingName: "@ctitle(6, 12)",
          fittingType: "@ctitle(4, 6)",
          material: "@ctitle(6, 10)",
          dimension: "@float(0, 100, 1, 2)",
          standard: "@ctitle(8, 12)",
        },
      ],
    }).data,
  };
});

// PMC编码详情接口
Mock.mock(/\/api\/pipe-spec\/pmc-details\/(.+)/, "get", (options) => {
  // 提取编码
  const urlParts = options.url.split("/");
  const code = urlParts[urlParts.length - 1];

  return {
    code: 200,
    msg: "success",
    data: Mock.mock({
      code: code,
      service: "@ctitle(10, 20)",
      pipingMaterialClass: "@ctitle(8, 15)",
      pipe: "@ctitle(12, 20)",
      material: "@ctitle(6, 12)",
      pressureClass: "@ctitle(6, 10)",
      wallThickness: "@float(0, 100, 2, 3) mm",
    }),
  };
});
