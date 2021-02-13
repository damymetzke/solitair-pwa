import StackHandler from "./stackHandler";

export default class DisplayStackHandler extends StackHandler {
  constructor(cardBackImage: HTMLImageElement, cardImages: HTMLImageElement[]) {
    super([13, 13, 13, 14], cardBackImage);
  }

  getHome(stack: number, index: number): [number, number] {
    // last card is an exception as it is displayed on its back.
    if (stack === 3 && index === 13) {
      return [105 / 7, 1 / 7];
    }
    return [(8 / 7) * index + 1 / 7, (8 / 7) * stack * 1.5 + 1 / 7];
  }
}
