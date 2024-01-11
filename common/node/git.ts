import { exec } from "child_process";

// export const generateGitPatch = (src: string, target: string, path: string): Promise<void> => {
//   return new Promise<void>((resolve, reject) => {
//     exec(`git diff ${src} ${target} ${path} > ${path}.patch`, (err, stdout, stderr) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }
