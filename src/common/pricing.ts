import { current } from "../service/model.js";

export function exploreCost(water, mineral) {
    const creditCost = 200;
    const mineralCost = creditCost / 2;
    const waterCost = creditCost / 2 + Math.ceil(Math.pow(water / mineral, 2));
    return { creditCost, mineralCost, waterCost };
}
