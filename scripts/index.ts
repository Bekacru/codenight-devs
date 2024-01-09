import git from "simple-git";
import fs from "fs";

async function run() {
  const repository = git();
  const log = await repository.log({ maxCount: 2 });
  const previousCommit = log.all[0];
  if (previousCommit.message.startsWith("new:")) {
    await repository.raw(
      ["diff", "--name-only", previousCommit.hash, log.all[1].hash],
      async (err, result) => {
        const files = result.split("\n");
        const file = files.find((f) => f.startsWith("profiles/"));
        if (!file) return;
        const dir = process.cwd();
        const fullPath = file;
        const splitted = fullPath.split("/");
        const fileName = splitted[splitted.length - 1];
        const language = splitted[1];
        const fileContent = fs.readFileSync(`${dir}/${fullPath}`, "utf8");
        const path = `${dir}/${fullPath.replace(
          `/${fileName}`,
          ""
        )}/${language}.md`;
        const readme = fs.readFileSync(path, "utf8");
        const filesInLang = fs.readdirSync(
          `${dir}/${fullPath.replace(`/${fileName}`, "")}`
        );
        const nextNumber = filesInLang.length - 1;
        const fileContentWithNumber = fileContent.replace(
          "### Developer",
          `### Developer ${nextNumber}`
        );
        const newReadme = readme + "\n" + fileContentWithNumber;
        fs.writeFileSync(path, newReadme);
      }
    );
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
