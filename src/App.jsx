import { useMemo, useState } from "react";

const numberFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 2,
});

const createInitialItem = () => ({
  weight: "",
  price: "",
});

const parsePositiveNumber = (value) => {
  if (value === "") {
    return null;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
};

const parseNonNegativeNumber = (value) => {
  if (value === "") {
    return null;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric < 0) {
    return null;
  }

  return numeric;
};

const calculateUnitPrice = (weight, price) => {
  if (weight == null || price == null || weight === 0) {
    return null;
  }

  return (price / weight) * 100;
};

const buildComparison = (firstUnitPrice, secondUnitPrice) => {
  if (firstUnitPrice == null || secondUnitPrice == null) {
    return null;
  }

  const difference = Math.abs(firstUnitPrice - secondUnitPrice);
  if (difference === 0) {
    return {
      message: "どちらも同じ価格です",
      difference,
    };
  }

  if (firstUnitPrice < secondUnitPrice) {
    return {
      message: "商品1のほうが安いです",
      difference,
    };
  }

  return {
    message: "商品2のほうが安いです",
    difference,
  };
};

const InputCard = ({
  index,
  item,
  onChange,
}) => (
  <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-800">商品{index}</h2>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        入力
      </span>
    </div>
    <div className="mt-5 space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        容量 (g)
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange(index, "weight", event.target.value)}
          placeholder="例: 250"
          type="number"
          value={item.weight}
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        価格 (円)
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange(index, "price", event.target.value)}
          placeholder="例: 498"
          type="number"
          value={item.price}
        />
      </label>
    </div>
  </section>
);

const ResultCard = ({
  label,
  unitPrice,
  isCheaper,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="mt-3 text-2xl font-bold text-slate-900">
      {unitPrice == null ? "--" : `${currencyFormatter.format(unitPrice)} / 100g`}
    </p>
    <p
      className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        unitPrice == null
          ? "bg-slate-100 text-slate-500"
          : isCheaper
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {unitPrice == null ? "入力待ち" : isCheaper ? "最安" : "比較対象"}
    </p>
  </div>
);

function App() {
  const [items, setItems] = useState([createInitialItem(), createInitialItem()]);

  const handleChange = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  };

  const { firstUnitPrice, secondUnitPrice, comparison } = useMemo(() => {
    const [first, second] = items;
    const firstWeight = parsePositiveNumber(first.weight);
    const secondWeight = parsePositiveNumber(second.weight);
    const firstPrice = parseNonNegativeNumber(first.price);
    const secondPrice = parseNonNegativeNumber(second.price);

    const firstUnit = calculateUnitPrice(firstWeight, firstPrice);
    const secondUnit = calculateUnitPrice(secondWeight, secondPrice);

    return {
      firstUnitPrice: firstUnit,
      secondUnitPrice: secondUnit,
      comparison: buildComparison(firstUnit, secondUnit),
    };
  }, [items]);

  const isFirstCheaper =
    firstUnitPrice != null &&
    secondUnitPrice != null &&
    firstUnitPrice < secondUnitPrice;

  const isSecondCheaper =
    firstUnitPrice != null &&
    secondUnitPrice != null &&
    secondUnitPrice < firstUnitPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 px-4 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            100gあたりの価格比較
          </p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            容量が違う商品をかんたん比較
          </h1>
          <p className="text-sm text-slate-600 sm:text-base">
            2つの商品それぞれの容量と価格を入力すると、100gあたりの価格と
            どちらが安いかがすぐにわかります。
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <InputCard
              key={`item-${index + 1}`}
              index={index + 1}
              item={item}
              onChange={handleChange}
            />
          ))}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">比較結果</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ResultCard
              label="商品1の100gあたり"
              unitPrice={firstUnitPrice}
              isCheaper={isFirstCheaper}
            />
            <ResultCard
              label="商品2の100gあたり"
              unitPrice={secondUnitPrice}
              isCheaper={isSecondCheaper}
            />
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-base font-semibold text-slate-800">
              {comparison
                ? comparison.message
                : "2つの商品に容量と価格を入力してください。"}
            </p>
            {comparison && (
              <p className="mt-2 text-sm text-slate-500">
                差額: {numberFormatter.format(comparison.difference)}円 / 100g
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
