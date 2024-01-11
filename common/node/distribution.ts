// import * as tf from "@tensorflow/tfjs-node";

// export function getRandomIntBetween(min: number, max: number) {
//   return Math.floor(Math.random() * (max - min)) + min;
// }

// export function getRandomBetween(min: number, max: number) {
//   return Math.random() * (max - min) + min;
// }

// export function getRandomBoolean(chance: number) {
//   return Math.random() < chance;
// }

// export const createBooleanDistribution = (
//   samples: number,
//   probability: number,
// ) => {
//   const distribution: boolean[] = [];

//   for (var i = 0; i < samples; i++) {
//     distribution.push(getRandomBoolean(probability));
//   }

//   return distribution;
// };

// export const bernoulli = (p: number, n: number) =>
//   tf.multinomial(tf.tensor1d([1 - p, p]), n).arraySync();
