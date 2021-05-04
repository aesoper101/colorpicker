/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs-extra");
const path = require("path");
const prompts = require("prompts");
const chalk = require("chalk");
const updateCheck = require("update-check");
const compareVersions = require("compare-versions");

const Handlebars = require("handlebars");

const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.resolve(projectRoot, "dist");

const devPkg = require("../package.json");

delete devPkg.dependencies["vue-class-component"];
delete devPkg.dependencies["vue-router"];

const vars = { ...devPkg, componentName: "colorpicker" };

const responses = {
  update: false,
  version: "",
  npmName: "",
  componentName: "",
};

const kebabcase = (string) =>
  string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();

const genVersionFile = async () => {
  const response = await prompts(
    {
      type: "confirm",
      name: "confirm",
      message: "确认是否生成版本文件(package.json)?",
      initial: true,
    },
    {
      onCancel,
    }
  );

  if (response.confirm) {
    const srcPath = path.resolve(projectRoot, "build/library-package.json");
    const destPath = path.resolve(distRoot, "package.json");

    const template = Handlebars.compile(fs.readFileSync(srcPath).toString());
    const content = template(
      Object.assign(vars, {
        name: responses.npmName,
        version: responses.version,
        componentName: responses.componentName,
      })
    );

    fs.writeFileSync(destPath, content);
  } else {
    process.exit();
  }
};

const copyFile = async () => {
  if (fs.existsSync(path.resolve(projectRoot, "README.md"))) {
    fs.copyFileSync(
      path.resolve(projectRoot, "README.md"),
      path.resolve(distRoot, "README.md")
    );
  }

  if (fs.existsSync(path.resolve(projectRoot, "LICENSE"))) {
    fs.copyFileSync(
      path.resolve(projectRoot, "LICENSE"),
      path.resolve(distRoot, "LICENSE")
    );
  }
};

const checkForUpdates = async () => {
  let update = null;
  try {
    update = await updateCheck(devPkg);
  } catch (err) {
    const errIntro = ` ${devPkg.name} 版本检查失败`;
    console.error(
      `\r\n${chalk.black.bgRed(errIntro)}${chalk.red("-->")} ${err}\r\n`
    );
    update = null;
  }

  if (update) {
    responses.update = update;
    console.info(chalk.green("当前代码仓库最新版本号: %s"), update.latest);
  }
};

// 退出
const onCancel = () => {
  console.log(chalk.yellow("用户中断运行程序. 谢谢您的使用!"));
  process.exit();
};

const getVersion = async () => {
  if (responses.update) {
    const res = compareVersions(devPkg.version, responses.update.latest);
    if (res <= 0) {
      const question = {
        type: "text",
        name: "version",
        message: "你输入您要生成的版本号: ",
        initial: devPkg.version,
      };
      const response = await prompts(question, { onCancel });
      if (compareVersions(response.version, responses.update.latest) <= 0) {
        console.log(
          chalk.yellow("你输入的版本号") +
            chalk.yellow("必须大于当前仓库最新版本号") +
            chalk.bold(chalk.blue("%s")),
          responses.update.latest
        );
        await getVersion();
      } else {
        responses.version = response.version;
      }
    }
  }
};

const getName = async () => {
  const questions = [
    {
      type: "text",
      name: "npmName",
      message: `请输入npm仓库名称: `,
      initial: devPkg.name,
      validate(val) {
        const kebabName = kebabcase(val).trim();
        return kebabName !== "";
      },
    },
    {
      type: "text",
      name: "componentName",
      message: `请输入组件名称: `,
      initial: devPkg.main.replace("dist/", "").split(".")[0],
      validate(val) {
        const kebabName = kebabcase(val).trim();
        return kebabName !== "";
      },
    },
  ];

  let tmpKebabName = "";
  const response = await prompts(questions, {
    onSubmit(prompt, answer) {
      if (prompt.name === "npmName") tmpKebabName = kebabcase(answer).trim();
      if (prompt.name === "componentName")
        tmpKebabName = kebabcase(answer).trim();
    },
    onCancel,
  });
  responses.npmName = response.npmName;
  responses.componentName = response.componentName
    ? response.componentName
    : tmpKebabName;
};

checkForUpdates()
  .then(getName)
  .then(getVersion)
  .then(genVersionFile)
  .then(copyFile)
  .then(() => {
    console.log(chalk.green("package.json完成"));
  });
