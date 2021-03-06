import { coordinatesFromCard } from "./canvasManager";
import Card from "./card";

export interface CardRect {
  img: HTMLImageElement;
  top: number;
  left: number;
  width: number;
}

function drawCard(
  context: CanvasRenderingContext2D,
  { img, left, top, width }: CardRect
): void {
  context.fillStyle = "#0000ff";

  context.drawImage(img, left, top, width, width * 1.5);
}

function forEachDouble<T>(
  array: T[][],
  callback: (
    value: T,
    totalIndex: number,
    outterIndex: number,
    innerIndex: number
  ) => void
) {
  let totalIndex = 0;
  array.forEach((innerArray, outerIndex) => {
    innerArray.forEach((value, innerIndex) => {
      callback(value, totalIndex++, outerIndex, innerIndex);
    });
  });
}

export default class CardCollection {
  cards: Card[][];

  cardBackImage: HTMLImageElement;

  constructor(numCards: number[], cardBackImage: HTMLImageElement) {
    this.cardBackImage = cardBackImage;
    this.cards = [];
    for (let i = 0; i < numCards.length; ++i) {
      const currentNumCards = numCards[i];
      this.cards.push([]);
      for (let j = 0; j < currentNumCards; ++j) {
        this.cards[this.cards.length - 1].push({
          image: cardBackImage,
          isFront: true,
          left: 0,
          top: 0,
          canDrag: false,
          isMoving: false,
        });
      }
    }
  }

  cardExists(stack: number, index: number): boolean {
    if (stack >= this.cards.length) {
      return false;
    }

    return index < this.cards[stack].length;
  }

  getCard(stack: number, index: number): Card {
    return this.cards[stack][index];
  }

  findCard(card: Card): [number, number] | null {
    let result = null;
    this.forEachCard((cardPossibility, _index, stack, cardIndex) => {
      if (card === cardPossibility) {
        result = [stack, cardIndex];
      }
    });
    return result;
  }

  forEachCard(
    callback: (
      value: Card,
      totalIndex: number,
      outterIndex: number,
      innerIndex: number
    ) => void
  ): void {
    forEachDouble(this.cards, callback);
  }

  static createDisplay(
    cardBackImage: HTMLImageElement,
    cardFrontImages: HTMLImageElement[]
  ): CardCollection {
    const result = new CardCollection([13, 13, 13, 14], cardBackImage);
    forEachDouble(result.cards, (card, index, outterIndex, innerIndex) => {
      card.image = cardFrontImages[index % cardFrontImages.length];
      card.left = (8 / 7) * innerIndex + 1 / 7;
      card.top = outterIndex * (8 / 7) * 1.5 + 1 / 7;
      card.canDrag = true;
    });
    result.cards[0].push(result.cards[3][13]);
    result.cards[3].pop();
    result.cards[0][13].left = 105 / 7;
    result.cards[0][13].top = 1 / 7;
    result.cards[0][13].isFront = false;

    return result;
  }

  drawStatic(context: CanvasRenderingContext2D): void {
    forEachDouble(this.cards, (card) => {
      if (card.isMoving) {
        return;
      }
      const [canvasWidth] = coordinatesFromCard(1, 1).toCanvas();
      const [canvasX, canvasY] = coordinatesFromCard(
        card.left,
        card.top
      ).toCanvas();
      drawCard(context, {
        img: card.isFront ? card.image : this.cardBackImage,
        left: canvasX,
        top: canvasY,
        width: canvasWidth,
      });
    });
  }

  drawMove(context: CanvasRenderingContext2D): void {
    forEachDouble(this.cards, (card) => {
      if (!card.isMoving) {
        return;
      }
      const [canvasWidth] = coordinatesFromCard(1, 1).toCanvas();
      const [canvasX, canvasY] = coordinatesFromCard(
        card.left,
        card.top
      ).toCanvas();
      drawCard(context, {
        img: card.isFront ? card.image : this.cardBackImage,
        left: canvasX,
        top: canvasY,
        width: canvasWidth,
      });
    });
  }
}
