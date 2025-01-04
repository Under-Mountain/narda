import { current } from "../service/model.js";

export function exploreCost() {
    const creditCost = 200;
    const mineralCost = creditCost / 2;
    const waterCost = creditCost / 2 + Math.ceil(Math.pow(current.resources.water.balance / current.resources.mineral.balance, 2));
    return { creditCost, mineralCost, waterCost };
}
