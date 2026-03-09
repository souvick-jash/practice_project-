export const getMarkedupPrice = (cost: number, markup: number, formula: string) => {
  if (!markup) return 0;
  if (!formula) return 0;

  switch (formula) {
    case 'Markup-Formula': {
      let markupMultiplier = 1 / (1 - markup / 100);
      markupMultiplier = parseFloat(markupMultiplier.toFixed(2));
      return cost * markupMultiplier;
    }
    case 'True-Margin-Formula': {
      let markupPercentage = markup / 100;
      markupPercentage = parseFloat(markupPercentage.toFixed(2));
      return cost / (1 - markupPercentage);
    }
    default:
      return 0;
  }
};

export const getManufacturerDuscountedPrice = (cost: number, discount: number) => {
  if (!discount) return cost;
  let discountPercentage = discount / 100;
  discountPercentage = parseFloat(discountPercentage.toFixed(2));
  return cost * (1 - discountPercentage);
};
