export function getPlaceTier(yld, cap) {
    let place: string;
    let tier: string;

    if (cap > 6000) place = 'house';
    else if (cap > 2000) place = 'settlement';
    else place = 'camp';

    if (yld > .20) tier = 'h';
    else if (yld > .10) tier = 'm';
    else tier = 'l';

    return { place, tier };
}
